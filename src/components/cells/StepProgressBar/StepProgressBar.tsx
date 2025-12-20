import { cn } from "@/lib/utils"

export const StepProgressBar = ({
  steps,
  currentStep,
}: {
  steps: string[]
  currentStep: number
}) => {
  const isCanceled = currentStep === 4

  const gridColsClass =
    {
      1: "grid-cols-1",
      2: "grid-cols-2",
      3: "grid-cols-3",
      4: "grid-cols-4",
      5: "grid-cols-5",
      6: "grid-cols-6",
    }[steps.length] || "grid-cols-4"

  const currentStepLabel = steps[currentStep] || steps[steps.length - 1]

  return (
    <div className="flex flex-col gap-2">
      {/* Progress bar */}
      <div className={cn("grid h-10 md:h-16", gridColsClass)}>
        {steps.map((step, index) => {
          const isActive = isCanceled ? index === 4 : index <= currentStep
          const showLine = isCanceled ? false : index <= currentStep

          return (
            <div key={step} className="relative">
              {/* Labels - hidden on mobile, visible on md+ */}
              <p
                className={cn(
                  "label-md hidden text-center md:block",
                  isActive
                    ? "!font-bold text-green-600"
                    : "!font-normal text-[#3b3634]",
                  isCanceled && index === 4 ? "!font-bold text-red-600" : ""
                )}
              >
                {step}
              </p>

              {/* Dots and lines */}
              <div className="absolute bottom-2 left-0 flex w-full items-center justify-center">
                <div
                  className={cn(
                    "absolute left-0 w-1/2 border-y",
                    showLine && index <= currentStep
                      ? "border-[#3b3634]"
                      : "border-transparent"
                  )}
                />
                <div
                  className={cn(
                    "absolute left-1/2 w-1/2 border-y",
                    showLine && index + 1 <= currentStep
                      ? "border-[#3b3634]"
                      : "border-transparent",
                    !isCanceled && currentStep === steps.length - 1
                      ? "border-[#3b3634]"
                      : ""
                  )}
                />
                <div
                  className={cn(
                    "z-10 mx-auto h-3 w-3 rounded-full border-2 md:h-2 md:w-2",
                    isActive
                      ? isCanceled && index === 4
                        ? "border-red-600 bg-red-600"
                        : "border-[#3b3634] bg-green-600"
                      : "border-gray-300 bg-gray-300"
                  )}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* Current step label - visible only on mobile */}
      <p
        className={cn(
          "text-center text-sm font-bold md:hidden",
          isCanceled ? "text-red-600" : "text-green-600"
        )}
      >
        {currentStepLabel}
      </p>
    </div>
  )
}