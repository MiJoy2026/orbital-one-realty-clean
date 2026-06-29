"use client";

import Image from "next/image";
import { useState } from "react";

export default function AttractionGallery({
  images,
  title,
}: {
  images: string[];
  title: string;
}) {
  const [selectedImage, setSelectedImage] = useState(images[0]);

  return (
    <section className="mt-12">
      <h2 className="text-3xl font-black uppercase text-yellow-400">
        Image Gallery
      </h2>

      <Image
        src={selectedImage}
        alt={title}
        width={1200}
        height={700}
        className="mt-8 h-[460px] w-full rounded-3xl border border-yellow-400/30 object-cover"
      />

      <div className="mt-6 grid gap-4 md:grid-cols-4">
        {images.map((image) => (
          <button
            key={image}
            type="button"
            onClick={() => setSelectedImage(image)}
            className="overflow-hidden rounded-2xl border border-white/20"
          >
            <Image
              src={image}
              alt={title}
              width={400}
              height={250}
              className="h-32 w-full object-cover"
            />
          </button>
        ))}
      </div>
    </section>
  );
}