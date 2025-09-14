// 'use client'

// import SquareButton from '@/components/ui/Buttons/SquareButton'
// import { useModalStore } from '@/store/useModalStore'

// export default function ModalProvider() {
//   const { isOpen, content, closeModal } = useModalStore()

//   if (!isOpen || !content) return null

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
//       <div className="bg-fill-white shadow-card p-spacing-lg w-[400px] rounded-md text-center">
//         {content.title && (
//           <h3 className="font-title3 mb-spacing-sm text-label-strong">
//             {content.title}
//           </h3>
//         )}
//         <p className="font-body2 mb-spacing-md text-label-default whitespace-pre-line">
//           {content.message}
//         </p>
//         <SquareButton
//           variant="primary"
//           size="md"
//           className="w-full"
//           onClick={() => {
//             content.onConfirm?.()
//             closeModal()
//           }}
//         >
//           {content.confirmText ?? '확인'}
//         </SquareButton>
//       </div>
//     </div>
//   )
// }

'use client'

import SquareButton from '@/components/ui/Buttons/SquareButton'
import { useModalStore } from '@/store/useModalStore'

export default function ModalProvider() {
  const { isOpen, content, closeModal } = useModalStore()

  if (!isOpen || !content) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-fill-white shadow-card p-spacing-lg w-[400px] rounded-md text-center">
        {content.title && (
          <h3 className="font-title3 mb-spacing-sm text-label-strong">
            {content.title}
          </h3>
        )}

        {/* ✅ 문자열이면 <p>, JSX면 그대로 */}
        {typeof content.message === 'string' ? (
          <p className="font-body2 mb-spacing-md text-label-default whitespace-pre-line">
            {content.message}
          </p>
        ) : (
          <div className="mb-spacing-md">{content.message}</div>
        )}

        {/* confirmText 있을 때만 버튼 렌더링 */}
        {content.confirmText && (
          <SquareButton
            variant="primary"
            size="md"
            className="w-full"
            onClick={() => {
              content.onConfirm?.()
              closeModal()
            }}
          >
            {content.confirmText ?? '확인'}
          </SquareButton>
        )}
      </div>
    </div>
  )
}
