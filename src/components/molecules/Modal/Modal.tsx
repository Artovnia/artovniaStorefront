import { CloseIcon } from "@/icons"

export const Modal = ({
  children,
  heading,
  onClose,
}: {
  children: React.ReactNode
  heading: string
  onClose: () => void
}) => {
  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center p-4 sm:p-6 md:p-8 pt-20 pb-24 sm:pt-6 sm:pb-6">
      <div
        className="bg-tertiary/60 absolute inset-0 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-20 bg-primary rounded-sm w-full max-w-[600px] max-h-[calc(100vh-11rem)] sm:max-h-[90vh] flex flex-col shadow-xl">
        <div className="uppercase flex justify-between items-center heading-md border-b px-4 py-5 flex-shrink-0">
          {heading}
          <div onClick={onClose} className="cursor-pointer hover:opacity-70 transition-opacity">
            <CloseIcon size={20} />
          </div>
        </div>
        <div className="overflow-y-auto flex-1 py-5">{children}</div>
      </div>
    </div>
  )
}
