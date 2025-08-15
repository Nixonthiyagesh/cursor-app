import { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  TrendingUp, 
  DollarSign, 
  BarChart3, 
  Shield, 
  Zap, 
  Users, 
  CheckCircle, 
  ArrowRight,
  Star,
  Play,
  Download,
  Globe,
  Lock,
  Clock,
  Smartphone,
  Database,
  FileText,
  PieChart,
  Calendar,
  Target
} from 'lucide-react'
import { cn } from '../lib/utils'
import HeroSection from '../components/ui/HeroSection'
import DemoScreenshot from '../components/ui/DemoScreenshot'

export default function Landing() {
  const [activeTab, setActiveTab] = useState<'monthly' | 'yearly'>('monthly')

  const features = [
    {
      icon: TrendingUp,
      title: "Real-time Analytics",
      description: "Get instant insights into your business performance with live dashboards and automated reporting."
    },
    {
      icon: DollarSign,
      title: "Smart Financial Tracking",
      description: "Track sales, expenses, and profits with intelligent categorization and trend analysis."
    },
    {
      icon: BarChart3,
      title: "Advanced Reporting",
      description: "Generate comprehensive reports and export data in multiple formats for better decision making."
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Bank-level security with encrypted data, role-based access, and compliance standards."
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Built with modern technology for blazing fast performance and seamless user experience."
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Work together with your team, share insights, and manage permissions efficiently."
    }
  ]

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "CEO, TechStart Inc",
      content: "Bizlytic transformed how we track our business metrics. The real-time insights helped us increase revenue by 40% in just 3 months.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face"
    },
    {
      name: "Michael Chen",
      role: "Founder, Green Solutions",
      content: "The expense tracking and reporting features are incredible. We've saved countless hours on financial management.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
    },
    {
      name: "Emily Rodriguez",
      role: "Operations Manager, Retail Plus",
      content: "Finally, a dashboard that actually makes sense! The interface is intuitive and the insights are actionable.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face"
    }
  ]

  const pricingPlans = {
    monthly: [
      {
        name: "Starter",
        price: 0,
        period: "month",
        description: "Perfect for small businesses getting started",
        features: [
          "Up to 100 transactions/month",
          "Basic reporting",
          "Email support",
          "Mobile app access",
          "Data export (CSV)"
        ],
        popular: false,
        cta: "Get Started Free"
      },
      {
        name: "Professional",
        price: 29,
        period: "month",
        description: "Ideal for growing businesses",
        features: [
          "Unlimited transactions",
          "Advanced analytics",
          "Priority support",
          "Team collaboration",
          "Data export (Excel, PDF)",
          "Custom categories",
          "API access"
        ],
        popular: true,
        cta: "Start Free Trial"
      },
      {
        name: "Enterprise",
        price: 99,
        period: "month",
        description: "For large organizations with complex needs",
        features: [
          "Everything in Professional",
          "Custom integrations",
          "Dedicated account manager",
          "Advanced security features",
          "White-label options",
          "Custom reporting",
          "SLA guarantee"
        ],
        popular: false,
        cta: "Contact Sales"
      }
    ],
    yearly: [
      {
        name: "Starter",
        price: 0,
        period: "month",
        description: "Perfect for small businesses getting started",
        features: [
          "Up to 100 transactions/month",
          "Basic reporting",
          "Email support",
          "Mobile app access",
          "Data export (CSV)"
        ],
        popular: false,
        cta: "Get Started Free"
      },
      {
        name: "Professional",
        price: 24,
        period: "month",
        description: "Ideal for growing businesses",
        features: [
          "Unlimited transactions",
          "Advanced analytics",
          "Priority support",
          "Team collaboration",
          "Data export (Excel, PDF)",
          "Custom categories",
          "API access"
        ],
        popular: true,
        cta: "Start Free Trial",
        savings: "Save 17%"
      },
      {
        name: "Enterprise",
        price: 79,
        period: "month",
        description: "For large organizations with complex needs",
        features: [
          "Everything in Professional",
          "Custom integrations",
          "Dedicated account manager",
          "Advanced security features",
          "White-label options",
          "Custom reporting",
          "SLA guarantee"
        ],
        popular: false,
        cta: "Contact Sales",
        savings: "Save 20%"
      }
    ]
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="relative z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <span className="ml-2 text-xl font-bold text-gray-900">Bizlytic</span>
                </div>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <a href="#features" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors">Features</a>
                <a href="#pricing" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors">Pricing</a>
                <a href="#testimonials" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors">Reviews</a>
                <Link to="/login" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors">Login</Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/register" className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl">
                Get Started Free
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <HeroSection />

      {/* Demo Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              See Bizlytic in Action
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Experience the intuitive interface and powerful features that make business management effortless.
            </p>
          </div>
          
          <div className="flex justify-center">
            <DemoScreenshot />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful features designed to give you complete control over your business finances and performance.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group p-6 rounded-2xl bg-white border border-gray-200 hover:border-blue-200 transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-lg text-gray-600 mb-4">Trusted by thousands of businesses worldwide</p>
            <div className="flex justify-center items-center space-x-8 opacity-60">
              <div className="text-2xl font-bold text-gray-400">10K+</div>
              <div className="text-2xl font-bold text-gray-400">•</div>
              <div className="text-2xl font-bold text-gray-400">99.9%</div>
              <div className="text-2xl font-bold text-gray-400">•</div>
              <div className="text-2xl font-bold text-gray-400">24/7</div>
            </div>
            <div className="text-sm text-gray-500 mt-2">
              <span>Active Users</span>
              <span className="mx-4">Uptime</span>
              <span>Support</span>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Loved by Business Owners
            </h2>
            <p className="text-xl text-gray-600">
              See what our customers are saying about Bizlytic
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-8 rounded-2xl border border-gray-200 hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed">"{testimonial.content}"</p>
                <div className="flex items-center">
                  <img 
                    src={testimonial.avatar} 
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Choose the plan that fits your business needs
            </p>
            
            {/* Pricing Toggle */}
            <div className="inline-flex bg-gray-100 rounded-lg p-1 border border-gray-200">
              <button
                onClick={() => setActiveTab('monthly')}
                className={cn(
                  "px-6 py-2 rounded-md text-sm font-medium transition-all duration-200",
                  activeTab === 'monthly'
                    ? "bg-blue-600 text-white shadow-lg"
                    : "text-gray-600 hover:text-gray-900"
                )}
              >
                Monthly
              </button>
              <button
                onClick={() => setActiveTab('yearly')}
                className={cn(
                  "px-6 py-2 rounded-md text-sm font-medium transition-all duration-200",
                  activeTab === 'yearly'
                    ? "bg-blue-600 text-white shadow-lg"
                    : "text-gray-600 hover:text-gray-900"
                )}
              >
                Yearly
                {activeTab === 'yearly' && (
                  <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    Save up to 20%
                  </span>
                )}
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans[activeTab].map((plan, index) => (
              <div key={index} className={cn(
                "relative p-8 rounded-2xl border-2 transition-all duration-300 hover:shadow-xl hover:-translate-y-2",
                plan.popular
                  ? "border-blue-500 bg-white shadow-lg"
                  : "border-gray-200 bg-white hover:border-blue-200"
              )}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 mb-6">{plan.description}</p>
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                    {plan.price > 0 && (
                      <span className="text-gray-600 ml-2">/{plan.period}</span>
                    )}
                  </div>
                  {plan.savings && (
                    <div className="mt-2">
                      <span className="text-sm text-green-600 font-medium">{plan.savings}</span>
                    </div>
                  )}
                </div>
                
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Link
                  to={plan.name === "Enterprise" ? "/contact" : "/register"}
                  className={cn(
                    "w-full py-3 px-6 rounded-xl text-center font-medium transition-all duration-200",
                    plan.popular
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl"
                      : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                  )}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Business?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of business owners who are already using Bizlytic to grow their revenue and streamline operations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="bg-white text-blue-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg hover:shadow-xl">
              Start Free Trial
            </Link>
            <button className="border-2 border-white text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-white hover:text-blue-600 transition-all duration-200">
              Schedule Demo
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <span className="ml-2 text-xl font-bold">Bizlytic</span>
              </div>
              <p className="text-gray-400 mb-4">
                The smart business dashboard that helps you make data-driven decisions and grow your business faster.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Globe className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Lock className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Clock className="w-5 h-5" />
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Community</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 Bizlytic. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Terms of Service</a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}