import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, CheckCircle, Star, Users, Zap } from "lucide-react";
import { Link } from "wouter";
import signatarLogo from "@assets/signatar-logo-new.png";
import AuthModal from "@/components/auth-modal";

export default function Home() {
  const [showAuthModal, setShowAuthModal] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity">
              <img src={signatarLogo} alt="Signatar" className="w-10 h-10 object-contain" />
              <h1 className="text-2xl font-bold text-primary">Signatar</h1>
            </div>
          </Link>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => setShowAuthModal(true)}>
              Login
            </Button>
            <Link href="/builder">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <Badge variant="secondary" className="mb-6">
            ✨ Professional Email Signatures Made Simple
          </Badge>
          
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Create stunning 
            <span className="text-primary block">email signatures</span>
            in minutes
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Design professional email signatures with animated elements, custom branding, 
            and social media integration. No design skills required.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link href="/builder">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-white px-8 py-4 text-lg">
                <Zap className="w-5 h-5 mr-2" />
                Design for Free!
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="px-8 py-4 text-lg">
              View Examples
            </Button>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>10,000+ signatures created</span>
            </div>
            <div className="flex items-center space-x-2">
              <Star className="w-4 h-4 text-yellow-500" />
              <span>4.9/5 rating</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Always free</span>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Preview */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything you need for professional signatures
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Create signatures that make lasting impressions with our comprehensive toolkit
            </p>
          </div>

          {/* Reference Image Placeholders */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="aspect-video bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg mb-4 flex items-center justify-center">
                <div className="text-blue-600 text-center">
                  <Zap className="w-12 h-12 mx-auto mb-2" />
                  <p className="text-sm font-medium">Modern Templates</p>
                </div>
              </div>
              <h3 className="text-lg font-semibold mb-2">Professional Templates</h3>
              <p className="text-gray-600 text-sm">
                Choose from modern, minimal, and sales-focused designs crafted by professionals
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="aspect-video bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg mb-4 flex items-center justify-center">
                <div className="text-purple-600 text-center">
                  <Star className="w-12 h-12 mx-auto mb-2" />
                  <p className="text-sm font-medium">Animations</p>
                </div>
              </div>
              <h3 className="text-lg font-semibold mb-2">Dynamic Animations</h3>
              <p className="text-gray-600 text-sm">
                Add eye-catching animations with fade-ins, zooms, and custom effects
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="aspect-video bg-gradient-to-br from-green-50 to-green-100 rounded-lg mb-4 flex items-center justify-center">
                <div className="text-green-600 text-center">
                  <Users className="w-12 h-12 mx-auto mb-2" />
                  <p className="text-sm font-medium">Social Integration</p>
                </div>
              </div>
              <h3 className="text-lg font-semibold mb-2">Social Media Links</h3>
              <p className="text-gray-600 text-sm">
                Connect all your social profiles with beautiful icon integration
              </p>
            </Card>
          </div>

          {/* Screenshot Placeholder */}
          <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl p-8 aspect-[16/9] flex items-center justify-center mb-8">
            <div className="text-center text-gray-500">
              <div className="w-24 h-24 bg-gray-300 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">🎨</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Live Preview</h3>
              <p className="text-sm max-w-xs">
                See your signature come to life with real-time editing and preview
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-primary text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to create your signature?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of professionals who trust Signatar for their email signatures
          </p>
          
          <Link href="/builder">
            <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-gray-100 px-12 py-4 text-lg font-semibold">
              <Zap className="w-5 h-5 mr-2" />
              Design for Free!
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
          
          <p className="text-sm mt-4 opacity-75">
            No credit card required • Free forever • Export ready
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <img src={signatarLogo} alt="Signatar" className="w-8 h-8 object-contain" />
              <span className="text-lg font-semibold">Signatar</span>
            </div>
            
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-400">
              <a href="#" className="hover:text-white transition-colors">About</a>
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Support</a>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2025 Signatar. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </div>
  );
}