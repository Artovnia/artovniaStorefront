import { ProductPageAccordion } from '@/components/molecules';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';

/**
 * ProductPageDetails Component
 * 
 * Renders product descriptions that may contain:
 * - Plain text (legacy products)
 * - Markdown formatting (new products created with RichTextEditor)
 * - HTML (for backward compatibility)
 * 
 * The component uses react-markdown to safely parse and render Markdown,
 * following Medusa's pattern of storing formatted content as strings.
 */
export const ProductPageDetails = ({ details }: { details: string }) => {
  if (!details) return null

  return (
    <ProductPageAccordion heading="Opis produktu" defaultOpen={true}>
      <div className='product-details prose prose-sm max-w-none'>
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkBreaks]}
          rehypePlugins={[rehypeRaw, rehypeSanitize]}
          components={{
            p: ({node, ...props}) => <p className="mb-4" {...props} />,
            h2: ({node, ...props}) => <h2 className="text-xl font-bold mb-2 mt-4" {...props} />,
            h3: ({node, ...props}) => <h3 className="text-lg font-bold mb-2 mt-3" {...props} />,
            ul: ({node, ...props}) => <ul className="list-disc ml-6 mb-4" {...props} />,
            ol: ({node, ...props}) => <ol className="list-decimal ml-6 mb-4" {...props} />,
            li: ({node, ...props}) => <li className="mb-1" {...props} />,
            blockquote: ({node, ...props}) => (
              <blockquote className="border-l-4 border-gray-300 pl-4 italic my-4 text-gray-600" {...props} />
            ),
            table: ({node, ...props}) => (
              <div className="overflow-x-auto my-4">
                <table className="min-w-full border-collapse border border-gray-300" {...props} />
              </div>
            ),
            thead: ({node, ...props}) => <thead className="bg-[#3B3634] text-white font-instrument-sans" {...props} />,
            th: ({node, ...props}) => (
              <th className="border border-gray-300 px-4 py-2 text-left font-semibold font-instrument-sans" {...props} />
            ),
            td: ({node, ...props}) => (
              <td className="border border-gray-300 px-4 py-2" {...props} />
            ),
            del: ({node, ...props}) => <del className="text-white" {...props} />,
            input: ({node, ...props}) => {
              // Task list checkbox
              if (props.type === 'checkbox') {
                return <input type="checkbox" disabled className="mr-2" {...props} />;
              }
              return <input {...props} />;
            },
          }}
        >
          {details}
        </ReactMarkdown>
      </div>
    </ProductPageAccordion>
  );
};
