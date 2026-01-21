const SkeletonCardDetails = () => {
  return (
    <div className="flex flex-col gap-2 px-4 pb-4 pt-2 border-t border-cream-200 mt-2">
      <div className="h-3 bg-cream-200 w-1/4 animate-pulse"></div>
      <div className="h-12 w-full bg-cream-200 animate-pulse" />
    </div>
  )
}

export default SkeletonCardDetails
