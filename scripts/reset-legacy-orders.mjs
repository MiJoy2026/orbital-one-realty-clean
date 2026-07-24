import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

const CONFIRMATION_PHRASE = "DELETE-LEGACY-ORDERS-ONLY";
const execute = process.argv.includes("--execute");
const confirmationArgument = process.argv.find((argument) =>
  argument.startsWith("--confirm=")
);
const confirmation = confirmationArgument?.slice("--confirm=".length) ?? "";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error(
    "DATABASE_URL is missing. Run this script with the project's .env and .env.local files loaded."
  );
  process.exit(1);
}

const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter });

const GRID_V2_PATTERNS = [
  /^.+-R-C\d{3}-R\d{3}$/i,
  /^.+-CITY-\d{2}-CB-C\d{3}-R\d{3}$/i,
  /^.+-TOWN-\d{2}-TB-C\d{3}-R\d{3}$/i,
];

function isGridV2PropertyId(propertyId) {
  return GRID_V2_PATTERNS.some((pattern) => pattern.test(propertyId.trim()));
}

function isPaid(order) {
  return order.paymentStatus.trim().toLowerCase() === "paid";
}

function unique(values) {
  return Array.from(new Set(values.filter(Boolean)));
}

function timestampForFileName(date = new Date()) {
  return date.toISOString().replace(/[:.]/g, "-");
}

function sumRemainingSoldAcresByState(orders) {
  const totals = new Map();

  for (const order of orders) {
    if (!isPaid(order)) {
      continue;
    }

    const acres = Number(order.acreagePurchased ?? 0);

    if (!Number.isFinite(acres) || acres <= 0) {
      continue;
    }

    totals.set(order.lunarState, (totals.get(order.lunarState) ?? 0) + acres);
  }

  return totals;
}

async function main() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "asc" },
    include: { propertySnapshot: true },
  });

  if (orders.length === 0) {
    console.log("No orders exist. Nothing needs to be reset.");
    return;
  }

  const preservedGridV2Orders = orders.filter((order) =>
    isGridV2PropertyId(order.propertyId)
  );
  const legacyOrders = orders.filter(
    (order) => !isGridV2PropertyId(order.propertyId)
  );

  console.log("\nOrbital One legacy-only order cleanup");
  console.log("--------------------------------------");
  console.log(`Total orders found: ${orders.length}`);
  console.log(`Legacy orders selected for deletion: ${legacyOrders.length}`);
  console.log(`Grid V2 orders preserved: ${preservedGridV2Orders.length}`);

  if (preservedGridV2Orders.length > 0) {
    console.log("\nGrid V2 orders that will be preserved:");

    for (const order of preservedGridV2Orders) {
      console.log(
        `- ${order.propertyId} | ${order.certificateNumber} | ${order.paymentStatus}`
      );
    }
  }

  if (legacyOrders.length === 0) {
    console.log("\nNo legacy orders remain. No database records were changed.");
    return;
  }

  const legacyOrderIds = legacyOrders.map((order) => order.id);
  const legacyCertificateNumbers = legacyOrders.map(
    (order) => order.certificateNumber
  );
  const preservedPropertyIds = unique(
    preservedGridV2Orders.map((order) => order.propertyId)
  );
  const preservedPropertyIdSet = new Set(preservedPropertyIds);
  const releasableLegacyPropertyIds = unique(
    legacyOrders
      .map((order) => order.propertyId)
      .filter((propertyId) => !preservedPropertyIdSet.has(propertyId))
  );

  const legacyStripeSessionIds = unique(
    legacyOrders.map((order) => order.stripeSessionId)
  );
  const preservedStripeSessionIdSet = new Set(
    unique(preservedGridV2Orders.map((order) => order.stripeSessionId))
  );
  const exclusiveLegacyStripeSessionIds = legacyStripeSessionIds.filter(
    (sessionId) => !preservedStripeSessionIdSet.has(sessionId)
  );

  const legacyCustomerEmails = unique(
    legacyOrders.flatMap((order) => [order.email, order.recipientEmail])
  );

  const reservationConditions = [];

  if (releasableLegacyPropertyIds.length > 0) {
    reservationConditions.push({
      parcelKey: { in: releasableLegacyPropertyIds },
    });
  }

  if (exclusiveLegacyStripeSessionIds.length > 0) {
    const sessionCondition = {
      stripeCheckoutSessionId: { in: exclusiveLegacyStripeSessionIds },
    };

    reservationConditions.push(
      preservedPropertyIds.length > 0
        ? {
            AND: [
              sessionCondition,
              { parcelKey: { notIn: preservedPropertyIds } },
            ],
          }
        : sessionCondition
    );
  }

  const reservationWhere =
    reservationConditions.length > 0 ? { OR: reservationConditions } : null;

  const [allocations, reservations, properties, stateInventory, members] =
    await Promise.all([
      prisma.acreageAllocation.findMany({
        where: {
          OR: [
            { orderId: { in: legacyOrderIds } },
            { certificateNumber: { in: legacyCertificateNumbers } },
          ],
        },
      }),
      reservationWhere
        ? prisma.propertyReservation.findMany({ where: reservationWhere })
        : Promise.resolve([]),
      releasableLegacyPropertyIds.length > 0
        ? prisma.property.findMany({
            where: { id: { in: releasableLegacyPropertyIds } },
          })
        : Promise.resolve([]),
      prisma.stateInventory.findMany(),
      legacyCustomerEmails.length > 0
        ? prisma.member.findMany({
            where: { email: { in: legacyCustomerEmails } },
          })
        : Promise.resolve([]),
    ]);

  const legacySnapshotCount = legacyOrders.filter(
    (order) => order.propertySnapshot !== null
  ).length;
  const preservedSnapshotCount = preservedGridV2Orders.filter(
    (order) => order.propertySnapshot !== null
  ).length;
  const preservedSoldAcresByState =
    sumRemainingSoldAcresByState(preservedGridV2Orders);

  console.log("\nRecords selected for cleanup:");
  console.log(`- Legacy paid orders: ${legacyOrders.filter(isPaid).length}`);
  console.log(`- Legacy snapshots: ${legacySnapshotCount}`);
  console.log(`- Legacy acreage allocations: ${allocations.length}`);
  console.log(`- Matching legacy reservations: ${reservations.length}`);
  console.log(`- Legacy property records released: ${properties.length}`);
  console.log(
    `- HOA member records preserved: ${members.length} (accounts and memberships are never deleted)`
  );
  console.log(`- Grid V2 snapshots preserved: ${preservedSnapshotCount}`);

  if (!execute) {
    console.log("\nDRY RUN ONLY — no database records were changed.");
    console.log("Review the counts above. To execute the cleanup, run:");
    console.log(
      `node --env-file=.env --env-file=.env.local scripts\\reset-legacy-orders.mjs --execute --confirm=${CONFIRMATION_PHRASE}`
    );
    return;
  }

  if (confirmation !== CONFIRMATION_PHRASE) {
    console.error("\nExecution refused: the confirmation phrase is missing.");
    console.error(
      `Use --confirm=${CONFIRMATION_PHRASE} only after reviewing the dry run.`
    );
    process.exitCode = 3;
    return;
  }

  const backupDirectory = path.join(process.cwd(), "backups");
  await fs.mkdir(backupDirectory, { recursive: true });
  const backupPath = path.join(
    backupDirectory,
    `legacy-only-order-cleanup-${timestampForFileName()}.json`
  );

  const backup = {
    createdAt: new Date().toISOString(),
    purpose:
      "Backup before deleting legacy Orbital One trial orders while preserving Grid V2 sales",
    legacyOrdersSelectedForDeletion: legacyOrders,
    gridV2OrdersPreserved: preservedGridV2Orders,
    acreageAllocationsSelectedForDeletion: allocations,
    propertyReservationsSelectedForDeletion: reservations,
    propertyRecordsSelectedForRelease: properties,
    stateInventoryBeforeCleanup: stateInventory,
    matchedMembersPreserved: members,
  };

  await fs.writeFile(backupPath, JSON.stringify(backup, null, 2), "utf8");
  console.log(`\nBackup written before deletion:\n${backupPath}`);

  const result = await prisma.$transaction(
    async (transaction) => {
      const deletedSnapshots =
        await transaction.ownedPropertySnapshot.deleteMany({
          where: { orderId: { in: legacyOrderIds } },
        });

      const deletedAllocations =
        await transaction.acreageAllocation.deleteMany({
          where: {
            OR: [
              { orderId: { in: legacyOrderIds } },
              { certificateNumber: { in: legacyCertificateNumbers } },
            ],
          },
        });

      const deletedReservations = reservationWhere
        ? await transaction.propertyReservation.deleteMany({
            where: reservationWhere,
          })
        : { count: 0 };

      const deletedOrders = await transaction.order.deleteMany({
        where: { id: { in: legacyOrderIds } },
      });

      const releasedProperties =
        releasableLegacyPropertyIds.length > 0
          ? await transaction.property.updateMany({
              where: { id: { in: releasableLegacyPropertyIds } },
              data: { status: "Available" },
            })
          : { count: 0 };

      const resetStateInventory = await transaction.stateInventory.updateMany({
        data: { soldAcres: 0 },
      });

      let restoredStateInventoryRows = 0;

      for (const [stateName, soldAcres] of preservedSoldAcresByState.entries()) {
        const update = await transaction.stateInventory.updateMany({
          where: { stateName },
          data: { soldAcres },
        });
        restoredStateInventoryRows += update.count;
      }

      return {
        deletedSnapshots: deletedSnapshots.count,
        deletedAllocations: deletedAllocations.count,
        deletedReservations: deletedReservations.count,
        deletedOrders: deletedOrders.count,
        releasedProperties: releasedProperties.count,
        resetStateInventoryRows: resetStateInventory.count,
        restoredStateInventoryRows,
      };
    },
    { timeout: 60_000 }
  );

  const remainingOrders = await prisma.order.findMany({
    orderBy: { createdAt: "asc" },
    include: { propertySnapshot: true },
  });
  const remainingLegacyOrders = remainingOrders.filter(
    (order) => !isGridV2PropertyId(order.propertyId)
  );
  const remainingGridV2Orders = remainingOrders.filter((order) =>
    isGridV2PropertyId(order.propertyId)
  );
  const remainingSnapshots = await prisma.ownedPropertySnapshot.count();

  console.log("\nCLEANUP COMPLETE");
  console.log("--------------------------------------");
  console.log(`Legacy orders deleted: ${result.deletedOrders}`);
  console.log(`Legacy snapshots deleted: ${result.deletedSnapshots}`);
  console.log(`Legacy allocations deleted: ${result.deletedAllocations}`);
  console.log(`Legacy reservations deleted: ${result.deletedReservations}`);
  console.log(`Legacy properties released: ${result.releasedProperties}`);
  console.log(
    `State inventory rows recalculated: ${result.resetStateInventoryRows}`
  );
  console.log(`Orders remaining: ${remainingOrders.length}`);
  console.log(`Grid V2 orders remaining: ${remainingGridV2Orders.length}`);
  console.log(`Legacy orders remaining: ${remainingLegacyOrders.length}`);
  console.log(`Snapshots remaining: ${remainingSnapshots}`);
  console.log("User accounts and HOA member records were preserved.");

  if (remainingLegacyOrders.length > 0) {
    console.error(
      "\nWARNING: One or more non-Grid-V2 orders remain. Review them before continuing."
    );
    process.exitCode = 4;
  }
}

try {
  await main();
} catch (error) {
  console.error(
    "\nLegacy-only order cleanup failed. No further steps should be taken."
  );
  console.error(error);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
