"use client";

import React, { useState } from "react";
import Image from "next/image";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import {
  motion,
  useInView,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
} from "framer-motion";
import { useRef } from "react";

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
};

const fadeInLeft = {
  hidden: { opacity: 0, x: -40 },
  visible: { opacity: 1, x: 0 },
};

const fadeInRight = {
  hidden: { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0 },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1 },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const staggerFast = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const AnimatedSection = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={staggerContainer}
      className={className}
    >
      {children}
    </motion.div>
  );
};

const BrushDivider = ({ className = "" }: { className?: string }) => (
  <motion.svg
    className={`w-48 h-3 ${className}`}
    viewBox="0 0 300 15"
    fill="none"
    initial={{ pathLength: 0, opacity: 0 }}
    whileInView={{ pathLength: 1, opacity: 1 }}
    viewport={{ once: false }}
    transition={{ duration: 1.2, ease: "easeOut" }}
  >
    <motion.path
      d="M5 8c40-5 80-3 120 0s80 5 120 1c15-2 30-3 45-1"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      initial={{ pathLength: 0 }}
      whileInView={{ pathLength: 1 }}
      viewport={{ once: false }}
      transition={{ duration: 1.2, ease: "easeOut" }}
    />
  </motion.svg>
);


interface FounderCardProps {
  name: string;
  role: string;
  badge: string;
  badgeLabel: string;
  imageSrc: string;
  imageAlt: string;
  paragraphs: string[];
  interests: string[];
  reversed?: boolean;
  link?: { href: string; label: string };
  priority?: boolean;
  desktopImagePosition?: string;
  mobileImagePosition?: string;
}

const FounderCard = ({
  name,
  role,
  badge,
  badgeLabel,
  imageSrc,
  imageAlt,
  paragraphs,
  interests,
  reversed = false,
  link,
  priority = false,
  desktopImagePosition = "50% 50%",
  mobileImagePosition = "50% 50%",
}: FounderCardProps) => {
  const cardRef = useRef(null);
  const isInView = useInView(cardRef, { once: false, margin: "-80px" });
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start end", "end start"],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], ["-4%", "4%"]);
  const cardY = useTransform(scrollYProgress, [0, 1], ["2%", "-2%"]);

  const imageVariant = reversed ? fadeInRight : fadeInLeft;
  const textVariant = reversed ? fadeInLeft : fadeInRight;

  return (
    <motion.div
      ref={cardRef}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={staggerContainer}
      className="relative"
    >
      {/* Desktop layout */}
      <div
        className={`hidden md:grid md:grid-cols-12 items-stretch min-h-[540px] lg:min-h-[750px] ${
          reversed ? "" : ""
        }`}
      >
        {/* Image column */}
        <motion.div
          variants={imageVariant}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={`relative ${
            reversed
              ? "col-start-6 col-end-13 row-start-1"
              : "col-start-1 col-end-8 row-start-1"
          }`}
        >
          <motion.div
            style={{ y: imageY }}
            className="relative w-full h-full overflow-hidden rounded-2xl"
          >
            <Image
              src={imageSrc}
              alt={imageAlt}
              fill
              className="object-cover"
              style={{ objectPosition: desktopImagePosition }}
              priority={priority}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

            

            {/* Founder label on image */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className={`absolute bottom-5 ${reversed ? "right-5" : "left-5"}`}
            >
              <span className="inline-block px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-xs text-white font-instrument-sans tracking-wide border border-white/10">
                {badgeLabel}
              </span>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Text card - overlapping the image */}
        <motion.div
          variants={textVariant}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.15 }}
          style={{ y: cardY }}
          className={`relative z-10 flex items-center ${
            reversed
              ? "col-start-1 col-end-7 row-start-1"
              : "col-start-7 col-end-13 row-start-1"
          }`}
        >
          <div
            className={`relative w-full bg-[#2E2A28]/95 backdrop-blur-xl border border-white/[0.08] rounded-2xl shadow-2xl shadow-black/30 ${
              reversed ? "mr-auto ml-0" : "ml-auto mr-0"
            }`}
          >
            

            {/* Accent line at top */}
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: false }}
              transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
              className={`absolute top-0 ${
                reversed ? "right-0 origin-right" : "left-0 origin-left"
              } w-24 h-[2px] bg-gradient-to-r from-primary/80 to-transparent rounded-full md:hidden`}
            />

            <div className="px-8 py-9 lg:px-10 lg:py-11">
              <div className="flex items-baseline justify-between mb-1">
                <motion.h3
                  variants={fadeInUp}
                  transition={{ duration: 0.5 }}
                  className="font-instrument-serif text-3xl lg:text-4xl font-medium text-white"
                >
                  {name}
                </motion.h3>
                {link && (
                  <motion.a
                    variants={fadeInUp}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.05 }}
                    className="text-sm underline decoration-white/30 underline-offset-4 font-instrument-sans text-white/50 hover:text-white transition-colors"
                  >
                    {link.label}
                  </motion.a>
                )}
              </div>

              <motion.p
                variants={fadeInUp}
                transition={{ duration: 0.5, delay: 0.05 }}
                className="text-[11px] uppercase tracking-[0.2em] text-white/90 mb-6 font-instrument-sans font-medium"
              >
                {role}
              </motion.p>

              <motion.div
                variants={fadeInUp}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="w-10 h-[1px] bg-white/15 mb-6"
              />

              {paragraphs.map((text, i) => (
                <motion.p
                  key={i}
                  variants={fadeInUp}
                  transition={{ duration: 0.5, delay: 0.15 + i * 0.08 }}
                  className="text-white/90 leading-relaxed text-sm mb-3 last:mb-0"
                >
                  {text}
                </motion.p>
              ))}

              <motion.div
                variants={fadeInUp}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="mt-7 pt-5 border-t border-white/[0.06]"
              >
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/50 mb-3 font-instrument-sans">
                  Po godzinach
                </p>
                <motion.div
                  variants={staggerFast}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: false }}
                  className="flex flex-wrap gap-2"
                >
                  {interests.map((interest, index) => (
                    <motion.span
                      key={interest}
                      variants={{
                        hidden: { opacity: 0, scale: 0.8, y: 10 },
                        visible: { opacity: 1, scale: 1, y: 0 },
                      }}
                      transition={{ duration: 0.3 }}
                      whileHover={{
                        scale: 1.08,
                        y: -2,
                        backgroundColor: "rgba(255,255,255,0.08)",
                      }}
                      className="px-3 py-1.5 ring-1 ring-white/15 hover:ring-white/30 rounded-full text-xs text-gray-500 transition-colors cursor-default hover:text-white/80"
                    >
                      {interest}
                    </motion.span>
                  ))}
                </motion.div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Mobile layout */}
      <div className="md:hidden">
        <motion.div
          variants={scaleIn}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="relative rounded-2xl overflow-hidden bg-[#2E2A28]"
        >
          {/* Image portion */}
          <div className="relative aspect-[4/5] overflow-hidden">
            <Image
              src={imageSrc}
              alt={imageAlt}
              fill
              className="object-cover"
              style={{ objectPosition: mobileImagePosition }}
              priority={priority}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#2E2A28]" />

           

            {/* Label */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="absolute bottom-20 left-5"
            >
              <span className="inline-block px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs text-white font-instrument-sans border border-white/10">
                {badgeLabel}
              </span>
            </motion.div>

            {/* Name overlay on image */}
            <div className="absolute bottom-0 left-0 right-0 px-6 pb-2">
              <motion.h3
                variants={fadeInUp}
                transition={{ duration: 0.5 }}
                className="font-instrument-serif text-3xl font-medium text-white"
              >
                {name}
              </motion.h3>
            </div>
          </div>

          {/* Text portion - seamlessly connected */}
          <div className="relative px-6 pb-7 pt-2">
            {/* Accent line */}
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: false }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="w-16 h-[2px] bg-gradient-to-r from-white/80 to-transparent rounded-full mb-4 origin-left md:hidden"
            />

            <div className="flex items-baseline justify-between mb-4">
              <motion.p
                variants={fadeInUp}
                className="text-[11px] uppercase tracking-[0.2em] text-white/90 font-instrument-sans font-medium"
              >
                {role}
              </motion.p>
              {link && (
                <motion.a
                  variants={fadeInUp}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs underline decoration-white/30 underline-offset-4 font-instrument-sans text-white/50 hover:text-white transition-colors"
                >
                  {link.label}
                </motion.a>
              )}
            </div>

            {paragraphs.map((text, i) => (
              <motion.p
                key={i}
                variants={fadeInUp}
                transition={{ duration: 0.5, delay: 0.1 + i * 0.08 }}
                className="text-white/90 leading-relaxed text-sm mb-3 last:mb-0"
              >
                {text}
              </motion.p>
            ))}

            <motion.div
              variants={fadeInUp}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="mt-6 pt-5 border-t border-white/[0.06]"
            >
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/50 mb-3 font-instrument-sans">
                Po godzinach
              </p>
              <div className="flex flex-wrap gap-2">
                {interests.map((interest, index) => (
                  <motion.span
                    key={interest}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: false }}
                    transition={{
                      delay: 0.4 + index * 0.08,
                      duration: 0.3,
                    }}
                    className="px-3 py-1.5 ring-1 ring-white/15 rounded-full text-xs text-gray-500 hover:text-white/80 hover:ring-white/30 transition-colors cursor-default"
                  >
                    {interest}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

const AboutUsContent = () => {
  const [lastUpdated] = useState(new Date(2026, 0, 24));
  const heroRef = useRef(null);
  const { scrollYProgress: heroScroll } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroOpacity = useTransform(heroScroll, [0, 0.5], [1, 0]);
  const heroY = useTransform(heroScroll, [0, 0.5], [0, 60]);

  return (
    <div className="about-us-content overflow-hidden">
      {/* Hero Section */}
      <section ref={heroRef} className="relative py-16 md:py-24">
       

        <motion.div
          style={{ opacity: heroOpacity, y: heroY }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <AnimatedSection className="max-w-3xl">
            <motion.p
              variants={fadeInUp}
              transition={{ duration: 0.6 }}
              className="text-sm uppercase tracking-widest text-gray-500 mb-4 font-instrument-sans"
            >
              Nasza historia
            </motion.p>
            <motion.h1
              variants={fadeInUp}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-instrument-serif text-4xl sm:text-5xl md:text-6xl font-medium text-gray-900 mb-6 leading-tight"
            >
              Tworzymy przestrzeń
              <br />
              <motion.span
                className="text-primary inline-block"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false }}
                transition={{ delay: 0.4, duration: 0.7, ease: "easeOut" }}
              >
                dla sztuki
              </motion.span>
            </motion.h1>
            <motion.div
              variants={fadeInUp}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="mb-6"
            >
              <BrushDivider className="text-[#3B3634]/15" />
            </motion.div>
            <motion.p
              variants={fadeInUp}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-2xl"
            >
              Artovnia to rodzinna inicjatywa, która powstała z pasji do
              sztuki, designu i rękodzieła. Łączymy artystów z miłośnikami
              piękna.
            </motion.p>
          </AnimatedSection>
        </motion.div>
      </section>

      {/* Story Section */}
      <section className="py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <AnimatedSection>
              <motion.h2
                variants={fadeInLeft}
                transition={{ duration: 0.6 }}
                className="font-instrument-serif text-2xl md:text-3xl font-medium text-gray-900 mb-6"
              >
                Jak to się zaczęło?
              </motion.h2>
              <motion.div
                variants={fadeInLeft}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="space-y-4 text-gray-600 leading-relaxed"
              >
                <p>
                  Tworzymy ją my – Ania, artystka malarka, oraz Arek,
                  programista. Połączyliśmy nasze talenty, by stworzyć
                  miejsce, w którym twórcy mogą swobodnie prezentować i
                  sprzedawać swoje dzieła.
                </p>
                <p>
                  Wierzymy w autentyczność, kreatywność i wspieranie małych
                  twórców. Artovnia to nie tylko marketplace – to społeczność
                  ludzi, którzy cenią piękno i unikalność.
                </p>
              </motion.div>
            </AnimatedSection>
            <AnimatedSection>
              <motion.div
                variants={scaleIn}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className="relative"
              >
                <svg className="absolute" width="0" height="0">
                  <defs>
                    <clipPath
                      id="blobMask"
                      clipPathUnits="objectBoundingBox"
                    >
                      <path
                        d="M 0.25 0.02
                           C 0.95 -0.02, 0.65 0.05, 0.78 0.04
                           C 0.88 0.03, 0.95 0.1, 0.98 0.22
                           C 1.02 0.35, 0.96 0.45, 0.97 0.55
                           C 0.98 0.65, 0.92 0.72, 0.82 0.8
                           C 0.72 0.88, 0.62 0.92, 0.5 0.95
                           C 0.38 0.98, 0.25 1.02, 0.15 0.95
                           C 0.05 0.88, 0.02 0.78, 0.01 0.65
                           C 0 0.52, 0.04 0.4, 0.02 0.28
                           C 0 0.16, -0.02 0.08, 0.08 0.03
                           C 0.15 -0.01, 0.18 0.04, 0.25 0.02
                           Z"
                      />
                    </clipPath>
                  </defs>
                </svg>
                <div
                  className="aspect-[4/3] overflow-hidden p-4"
                  style={{ clipPath: "url(#blobMask)" }}
                >
                  <Image
                    src="/images/oNas/oNas.webp"
                    alt="Artovnia - przestrzeń dla sztuki"
                    fill
                    className="object-cover"
                    priority={true}
                  />
                </div>
              </motion.div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Founders Section */}
      <section className="py-16 md:py-24 bg-[#3B3634] relative overflow-hidden">
      

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <AnimatedSection className="text-center mb-16 md:mb-24">
            <motion.p
              variants={fadeInUp}
              transition={{ duration: 0.6 }}
              className="text-sm uppercase tracking-widest text-gray-400 mb-3 font-instrument-sans"
            >
              Poznaj nas
            </motion.p>
            <motion.h2
              variants={fadeInUp}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-instrument-serif text-3xl md:text-4xl font-medium text-white mb-4"
            >
              Ludzie stojący za Artovnią
            </motion.h2>
            <motion.div
              variants={fadeInUp}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="flex justify-center"
            >
              <BrushDivider className="text-white/15" />
            </motion.div>
          </AnimatedSection>

          {/* Ania — image left, text right */}
          <div className="max-w-6xl mx-auto mb-16 md:mb-28">
            <FounderCard
              name="Ania"
              role="Art Director / Content & Community"
              badge="🎨"
              badgeLabel="Współzałożycielka"
              imageSrc="/images/oNas/Ania.webp"
              imageAlt="Ania - Artystka malarka"
              desktopImagePosition="60% 22%"
              mobileImagePosition="50% 38%"
              priority
              paragraphs={[
                "Artystka malarka i pomysłodawczyni Artovni. Od lat tworzy i sprzedaje własną sztukę, dzięki czemu doskonale zna realia pracy twórczej oraz wyzwania, z jakimi mierzą się artyści i rękodzielnicy — od procesu tworzenia, przez promocję, aż po sprzedaż i budowanie własnej marki.",
                "W Artovni odpowiada za content, social media oraz kontakt ze sprzedawcami i klientami. Jest pierwszym punktem styku dla Twórców i dba o to, aby platforma była miejscem przyjaznym, transparentnym i realnie wspierającym rozwój kreatywnych marek.",
              ]}
              interests={[
                "🎨 Malarstwo",
                "📚 Taniec",
                "🌿 Natura",
                "☕ Kawa",
              ]}
            />
          </div>

          

          {/* Arek — text left, image right */}
          <div className="max-w-6xl mx-auto">
            <FounderCard
              name="Arek"
              role="Developer"
              badge="💻"
              badgeLabel="Współzałożyciel"
              imageSrc="/images/oNas/arek.webp"
              imageAlt="Arek - Programista"
              desktopImagePosition="50% 36%"
              mobileImagePosition="50% 32%"
              reversed
              link={{ href: "https://appcrates.pl", label: "appcrates.pl" }}
              paragraphs={[
                "Odpowiedzialny za techniczne aspekty platformy oraz projektowanie i rozwój rozwiązań, które zapewniają użytkownikom płynne, intuicyjne i niezawodne doświadczenie na każdym etapie korzystania z Artovni. Dba o stabilność, bezpieczeństwo i skalowalność systemu, tak aby platforma mogła rozwijać się razem z potrzebami Twórców i klientów.",
                "Uwielbia tworzyć nowe rzeczy i rozwiązywać problemy w sposób techniczny. Człowiek od procesów, który dba o to, by każdy element działał perfekcyjnie.",
              ]}
              interests={[
                "⛰️ Góry",
                "🏃 Sport",
                "🧠 Nauka",
                "🏎️ Simracing",
              ]}
            />
          </div>
        </div>
      </section>

      {/* Honorable Mention Section - Weronika */}
      {/*  <section className="py-16 md:py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-12 md:mb-16">
            <motion.h2
              variants={fadeInUp}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-instrument-serif text-3xl md:text-4xl font-medium text-gray-900 mb-3"
            >
              Kreacja wizualna
            </motion.h2>
            <motion.div
              variants={fadeInUp}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="flex justify-center mb-4"
            >
              <BrushDivider className="text-[#3B3634]/15" />
            </motion.div>
            <motion.p
              variants={fadeInUp}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-gray-600 max-w-2xl mx-auto"
            >
              Za piękny wygląd Artovnii odpowiada wyjątkowa
              projektantka, której talent nadał naszej platformie
              niepowtarzalny charakter.
            </motion.p>
          </AnimatedSection>

          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-5 gap-8 lg:gap-12 items-center">
              <AnimatedSection className="md:col-span-2">
                <motion.div
                  variants={scaleIn}
                  transition={{ duration: 0.7 }}
                  whileHover={{ rotate: 2 }}
                  className="relative"
                >
                  <div className="absolute -inset-4 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent rounded-3xl blur-2xl" />
                  <motion.div
                    whileHover={{ y: -8 }}
                    transition={{ duration: 0.3 }}
                    className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl"
                  >
                    <Image
                      src="/images/oNas/Weronika.webp"
                      alt="Weronika Grzesiowska - Graphic Designer"
                      fill
                      className="object-cover transition-transform duration-700 hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: false }}
                      transition={{
                        delay: 0.5,
                        duration: 0.5,
                        type: "spring",
                      }}
                      className="absolute top-4 right-4"
                    >
                      <div className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg">
                        <svg
                          className="w-6 h-6 text-primary"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                          />
                        </svg>
                      </div>
                    </motion.div>
                  </motion.div>
                </motion.div>
              </AnimatedSection>

              <AnimatedSection className="md:col-span-3">
                <motion.div
                  variants={fadeInRight}
                  transition={{ duration: 0.7 }}
                >
                  <motion.h3
                    variants={fadeInUp}
                    className="font-instrument-serif text-2xl md:text-3xl font-medium text-gray-900 mb-2"
                  >
                    Weronika
                  </motion.h3>
                  <motion.p
                    variants={fadeInUp}
                    className="text-sm uppercase tracking-wider text-primary mb-6 font-instrument-sans font-medium"
                  >
                    Graphic Designer
                  </motion.p>
                  <motion.div
                    variants={fadeInUp}
                    className="space-y-4 text-gray-600 leading-relaxed"
                  >
                    <p>
                      Absolwentka komunikacji wizerunkowej Uniwersytetu
                      Wrocławskiego i projektantka z Wrocławia. Od kilku
                      lat podejmuje twórcze wyzwania w różnych zakątkach
                      branży kreatywnej, dzięki czemu zyskała szeroką
                      perspektywę na projektowanie komunikacji.
                    </p>
                    <p>
                      W pracy dąży do odkrywania nowych kierunków,
                      eksperymentów z formą i nieustannie doskonali
                      warsztat. Ważny jest dla niej balans skuteczności
                      i estetyki w kreacjach.
                    </p>
                  </motion.div>

                  <motion.div
                    variants={fadeInUp}
                    transition={{ delay: 0.3 }}
                    className="mt-8 pt-6 border-t border-gray-200"
                  >
                    <p className="text-xs uppercase tracking-wider text-gray-400 mb-3 font-instrument-sans">
                      Po godzinach
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        "📷 Fotografia",
                        "🎤 Śpiew",
                        "🧠 Psychologia",
                        "📖 Ziny",
                        "🐦 Gołębie",
                      ].map((interest, index) => (
                        <motion.span
                          key={interest}
                          initial={{ opacity: 0, scale: 0.8 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          viewport={{ once: false }}
                          transition={{
                            delay: 0.4 + index * 0.1,
                            duration: 0.3,
                          }}
                          whileHover={{ scale: 1.05, y: -2 }}
                          className="px-3 py-1.5 ring-1 ring-gray-900/60 hover:bg-[#3b3634] rounded-full text-sm text-gray-700 transition-colors cursor-default hover:text-white"
                        >
                          {interest}
                        </motion.span>
                      ))}
                    </div>
                  </motion.div>
                </motion.div>
              </AnimatedSection>
            </div>
          </div>
        </div>
      </section> */}

      {/* Mission Section */}
      <section className="py-16 md:py-24 bg-[#F4F0EB] relative overflow-hidden">
       
       

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <AnimatedSection className="text-center mb-14">
            <motion.h2
              variants={fadeInUp}
              transition={{ duration: 0.6 }}
              className="font-instrument-serif text-3xl md:text-4xl font-medium text-[#3B3634] mb-3"
            >
              Nasza misja
            </motion.h2>
            <motion.div
              variants={fadeInUp}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="flex justify-center mb-4"
            >
              <BrushDivider className="text-[#3B3634]/15" />
            </motion.div>
            <motion.p
              variants={fadeInUp}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="text-[#3B3634]/60 max-w-2xl mx-auto"
            >
              Każdego dnia pracujemy nad tym, by Artovnia była najlepszym
              miejscem dla twórców i miłośników sztuki.
            </motion.p>
          </AnimatedSection>

          <AnimatedSection className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {[
              {
                icon: (
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                ),
                title: "Wspieranie twórców",
                description:
                  "Pomagamy lokalnym artystom dotrzeć do szerszego grona odbiorców",
              },
              {
                icon: (
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                    />
                  </svg>
                ),
                title: "Unikalne projekty",
                description:
                  "Promujemy ręczną pracę i niepowtarzalne dzieła sztuki",
              },
              {
                icon: (
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                ),
                title: "Społeczność",
                description:
                  "Budujemy przestrzeń dla miłośników sztuki i rękodzieła",
              },
              {
                icon: (
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                ),
                title: "Bezpieczeństwo",
                description:
                  "Zapewniamy bezpieczną i przyjazną platformę handlową",
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{
                  y: -6,
                  boxShadow: "0 20px 40px rgba(59,54,52,0.08)",
                  transition: { duration: 0.25 },
                }}
                className="group relative bg-white/70 backdrop-blur-sm border border-[#3B3634]/[0.08] p-8 transition-colors duration-300 hover:bg-white"
              >
                

                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                  className="w-12 h-12 rounded-full bg-[#3B3634]/[0.07] flex items-center justify-center text-[#3B3634] mb-5 group-hover:bg-[#3B3634] group-hover:text-white transition-colors duration-300"
                >
                  {item.icon}
                </motion.div>
                <h3 className="font-instrument-serif text-lg font-medium text-[#3B3634] mb-2">
                  {item.title}
                </h3>
                <p className="text-[#3B3634]/60 text-sm leading-relaxed">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
};

export default AboutUsContent;