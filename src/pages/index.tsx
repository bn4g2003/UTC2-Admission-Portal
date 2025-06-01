// import { HeroSection } from "@/components/hero-section"
// import { ProgramSpotlight } from "@/components/program-spotlight"
// import { VirtualTour } from "@/components/virtual-tour"
// import { AcademicExcellence } from "@/components/academic-excellence"
// import { AdmissionCards } from "@/components/admission-cards"
// import { WaveDivider } from "@/components/wave-divider"
// import { Footer } from "@/components/footer"
// import { ChatbotWidget } from "@/components/chatbot" // Thêm dòng này

// export default function HomePage() {
//   return (
//     <main className="min-h-screen bg-slate-50 overflow-x-hidden">
//       <HeroSection />
//       <WaveDivider variant="navy-to-white" />
//       <ProgramSpotlight />
//       <WaveDivider variant="white-to-navy" />
//       <AcademicExcellence />
//       <VirtualTour />
//       <WaveDivider variant="navy-to-gold" />
//       <AdmissionCards />
//       <Footer />
//       <ChatbotWidget /> 
//     </main>
//   )
// }

import { Header } from "@/components2/header"
import { HeroSection } from "@/components2/hero-section"
import { NewsSection } from "@/components2/news-section"
import { ProgramsSection } from "@/components2/programs-section"
import { AdmissionSection } from "@/components2/admission-section"
import { StatsSection } from "@/components2/stats-section"
import { ContactSection } from "@/components2/contact-section"
import { Footer } from "@/components2/footer"
import { ChatbotWidget } from "@/components/chatbot"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      <Header />
      <HeroSection />
      <NewsSection />
      <ProgramsSection />
      <AdmissionSection />
      <StatsSection />
      <ContactSection />
      <ChatbotWidget /> 
      <Footer />
    </main>
  )
}

