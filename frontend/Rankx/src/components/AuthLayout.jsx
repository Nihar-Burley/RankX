// src/components/AuthLayout.jsx
export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      
      {/* LEFT SIDE */}
      <div className="hidden md:flex flex-col justify-center px-16 bg-gradient-to-br from-green-600 to-green-800 text-white">
        <h1 className="text-4xl font-bold mb-4">RankX</h1>
        <p className="text-lg opacity-90 mb-6">
          Level up your coding journey with real-world problems & challenges.
        </p>

        <ul className="space-y-3 text-sm opacity-90">
          <li>✔ Secure authentication</li>
          <li>✔ Practice like interviews</li>
          <li>✔ Track your progress</li>
        </ul>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex items-center justify-center bg-[#0b0b0b]">
        <div className="w-full max-w-md bg-[#121212]/90 backdrop-blur-xl 
                        border border-gray-800 rounded-2xl p-8 shadow-2xl">
          
          <h2 className="text-2xl font-bold text-white mb-1">
            {title}
          </h2>
          <p className="text-gray-400 text-sm mb-6">
            {subtitle}
          </p>

          {children}
        </div>
      </div>
    </div>
  );
}
