import { HeroSection } from "@/components/hero-section"
import { ProgramSpotlight } from "@/components/program-spotlight"
import { VirtualTour } from "@/components/virtual-tour"
import { AcademicExcellence } from "@/components/academic-excellence"
import { AdmissionCards } from "@/components/admission-cards"
import { WaveDivider } from "@/components/wave-divider"
import { Footer } from "@/components/footer"
import { ChatbotWidget } from "@/components/chatbot" // Thêm dòng này

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50 overflow-x-hidden">
      <HeroSection />
      <WaveDivider variant="navy-to-white" />
      <ProgramSpotlight />
      <WaveDivider variant="white-to-navy" />
      <AcademicExcellence />
      <VirtualTour />
      <WaveDivider variant="navy-to-gold" />
      <AdmissionCards />
      <Footer />
      <ChatbotWidget /> 
    </main>
  )
}