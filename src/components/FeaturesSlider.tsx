'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/autoplay';

interface Feature {
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface FeaturesSliderProps {
  features: Feature[];
}

export default function FeaturesSlider({ features }: FeaturesSliderProps) {
  return (
    <Swiper
      modules={[Navigation, Pagination, Autoplay]}
      spaceBetween={30}
      slidesPerView={1}
      navigation
      pagination={{ clickable: true }}
      autoplay={{ delay: 3000 }}
      breakpoints={{
        640: {
          slidesPerView: 2,
        },
        1024: {
          slidesPerView: 3,
        },
      }}
      className="features-swiper"
    >
      {features.map((feature, index) => (
        <SwiperSlide key={index}>
          <div className="p-8 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow h-full">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6 mx-auto">
              {feature.icon}
            </div>
            <h3 className="text-2xl font-semibold mb-4 text-center">{feature.title}</h3>
            <p className="text-gray-600 text-center text-lg">{feature.description}</p>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
} 