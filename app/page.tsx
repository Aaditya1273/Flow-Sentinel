'use client'

import { Hero } from 'components/sections/Hero'
import { Stats } from 'components/sections/Stats'
import { Features } from 'components/sections/Features'
import { HowItWorks } from 'components/sections/HowItWorks'
import { Testimonials } from 'components/sections/Testimonials'
import { CTA } from 'components/sections/CTA'
import { Navbar } from 'components/layout/Navbar'
import { Footer } from 'components/layout/Footer'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <Stats />
      <Features />
      <HowItWorks />
      <Testimonials />
      <CTA />
      <Footer />
    </div>
  )
}