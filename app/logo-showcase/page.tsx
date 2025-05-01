import { LogoPlacement } from "@/components/logo-placement"

export default function LogoShowcasePage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-center mb-8">Logo Placement Options</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="relative bg-gray-50 rounded-lg p-4 aspect-video flex items-center justify-center">
          <p className="text-center text-gray-500">Top Left Position</p>
          <LogoPlacement position="top-left" size="small" />
        </div>

        <div className="relative bg-gray-50 rounded-lg p-4 aspect-video flex items-center justify-center">
          <p className="text-center text-gray-500">Top Right Position</p>
          <LogoPlacement position="top-right" size="small" />
        </div>

        <div className="relative bg-gray-50 rounded-lg p-4 aspect-video flex items-center justify-center">
          <p className="text-center text-gray-500">Bottom Left Position</p>
          <LogoPlacement position="bottom-left" size="small" />
        </div>

        <div className="relative bg-gray-50 rounded-lg p-4 aspect-video flex items-center justify-center">
          <p className="text-center text-gray-500">Bottom Right Position</p>
          <LogoPlacement position="bottom-right" size="small" />
        </div>
      </div>

      <div className="relative bg-gray-50 rounded-lg p-4 aspect-video flex items-center justify-center mb-12">
        <p className="text-center text-gray-500">Center Position</p>
        <LogoPlacement position="center" size="medium" showTagline />
      </div>

      <h2 className="text-2xl font-bold text-center mb-8">Logo Sizes</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="relative bg-gray-50 rounded-lg p-4 aspect-square flex items-center justify-center">
          <p className="text-center text-gray-500">Small Size</p>
          <LogoPlacement position="center" size="small" />
        </div>

        <div className="relative bg-gray-50 rounded-lg p-4 aspect-square flex items-center justify-center">
          <p className="text-center text-gray-500">Medium Size</p>
          <LogoPlacement position="center" size="medium" />
        </div>

        <div className="relative bg-gray-50 rounded-lg p-4 aspect-square flex items-center justify-center">
          <p className="text-center text-gray-500">Large Size</p>
          <LogoPlacement position="center" size="large" />
        </div>
      </div>

      <h2 className="text-2xl font-bold text-center mb-8">With Tagline</h2>

      <div className="relative bg-gray-50 rounded-lg p-4 aspect-video flex items-center justify-center mb-12">
        <LogoPlacement position="center" size="large" showTagline />
      </div>
    </div>
  )
}
