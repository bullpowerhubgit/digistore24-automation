export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            🚀 Digistore24 Automation Suite
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Complete automation suite for Digistore24 with Next.js 14, TypeScript, and real-time webhooks.
            Manage sales, track affiliates, and get instant notifications.
          </p>
          <div className="flex gap-4 justify-center">
            <a
              href="/dashboard"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Go to Dashboard
            </a>
            <a
              href="#features"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold border-2 border-blue-600 hover:bg-blue-50 transition-colors"
            >
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">✨ Features</h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard
            icon="🔄"
            title="Real-time Webhooks"
            description="Instant notifications for sales, refunds, and affiliates with automatic data processing"
          />
          <FeatureCard
            icon="📊"
            title="Sales Dashboard"
            description="Visual analytics and reporting with interactive charts and real-time statistics"
          />
          <FeatureCard
            icon="💾"
            title="Supabase Integration"
            description="Automatic data storage and sync with powerful PostgreSQL database"
          />
          <FeatureCard
            icon="🔔"
            title="Discord Notifications"
            description="Get notified on every sale directly in your Discord server"
          />
          <FeatureCard
            icon="📧"
            title="Automated Reports"
            description="Daily and weekly email reports with comprehensive sales summaries"
          />
          <FeatureCard
            icon="⏰"
            title="Cron Jobs"
            description="Scheduled data synchronization every 30 minutes automatically"
          />
          <FeatureCard
            icon="🔐"
            title="Secure API"
            description="API key authentication and webhook signature verification"
          />
          <FeatureCard
            icon="📈"
            title="Analytics"
            description="Track revenue, conversion rates, and affiliate performance"
          />
          <FeatureCard
            icon="⚡"
            title="Lightning Fast"
            description="Built with Next.js 14 for optimal performance and SEO"
          />
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">🏗️ Tech Stack</h2>
          
          <div className="grid md:grid-cols-4 gap-6 text-center">
            <TechItem name="Next.js 14" description="App Router" />
            <TechItem name="TypeScript" description="Type Safety" />
            <TechItem name="Tailwind CSS" description="Styling" />
            <TechItem name="Supabase" description="Database" />
          </div>
        </div>
      </section>

      {/* Setup Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">🔧 Quick Setup</h2>
        
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-3xl mx-auto">
          <ol className="space-y-4">
            <SetupStep
              number={1}
              title="Clone the repository"
              code="git clone https://github.com/bullpowerhubgit/digistore24-automation.git"
            />
            <SetupStep
              number={2}
              title="Install dependencies"
              code="npm install"
            />
            <SetupStep
              number={3}
              title="Configure environment variables"
              code="cp .env.example .env.local"
            />
            <SetupStep
              number={4}
              title="Start development server"
              code="npm run dev"
            />
          </ol>

          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-900">
              <strong>Note:</strong> Make sure to configure your Digistore24 API key and Supabase credentials
              in the .env.local file before running the application.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to automate your Digistore24 business?</h2>
          <p className="text-xl mb-8 opacity-90">
            Get started now and save hours of manual work every week
          </p>
          <a
            href="/dashboard"
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-block"
          >
            Open Dashboard
          </a>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function TechItem({ name, description }: { name: string; description: string }) {
  return (
    <div className="p-4">
      <h3 className="font-bold text-lg mb-1">{name}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  );
}

function SetupStep({ number, title, code }: { number: number; title: string; code: string }) {
  return (
    <li className="flex gap-4">
      <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
        {number}
      </span>
      <div className="flex-1">
        <h4 className="font-semibold mb-2">{title}</h4>
        <code className="block bg-gray-100 px-4 py-2 rounded text-sm overflow-x-auto">
          {code}
        </code>
      </div>
    </li>
  );
}
