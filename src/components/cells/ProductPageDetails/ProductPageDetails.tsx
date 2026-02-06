import { ProductPageAccordion } from '@/components/molecules';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import { useMemo } from 'react';

/**
 * Detect whether content is HTML (new products from TipTap editor)
 * vs legacy markdown or plain text.
 */
const isHtmlContent = (text: string): boolean => {
  if (!text || !text.trim()) return false;
  const trimmed = text.trim();
  return /^<[a-z][^>]*>/i.test(trimmed) ||
    /<(p|h[1-6]|ul|ol|li|blockquote|pre|div|strong|em|u|s|del|a|table)\b/i.test(trimmed);
};

/**
 * Fix orphaned ** bold markers that span across paragraph breaks.
 * Only needed for legacy markdown content — not for HTML.
 */
const fixBoldMarkers = (md: string): string => {
  let text = md.replace(/^[•●◦▸▹►]\s*/gm, '- ');

  const parts = text.split(/(\n\s*\n)/);
  return parts.map(part => {
    if (/^\n\s*\n$/.test(part)) return part;
    const count = (part.match(/\*\*/g) || []).length;
    if (count % 2 === 0) return part;
    const trimmed = part.trim();
    if (trimmed.startsWith('**')) return part + '**';
    if (trimmed.endsWith('**')) return '**' + part;
    const lastIdx = part.lastIndexOf('**');
    return part.slice(0, lastIdx) + part.slice(lastIdx + 2);
  }).join('');
};

/**
 * ProductPageDetails Component
 * 
 * Renders product descriptions that may contain:
 * - HTML (new products created with TipTap WYSIWYG editor — lossless)
 * - Markdown (legacy products — rendered via ReactMarkdown)
 * - Plain text (very old products)
 * 
 * New products store HTML directly from TipTap, which preserves all formatting
 * including underline, strikethrough, and inline styles that markdown cannot represent.
 */
export const ProductPageDetails = ({ details }: { details: string }) => {
  const isHtml = useMemo(() => details ? isHtmlContent(details) : false, [details]);

  // Legacy markdown: preprocess to fix orphaned bold markers
  const normalizedMarkdown = useMemo(
    () => (details && !isHtml ? fixBoldMarkers(details) : ''),
    [details, isHtml]
  );

  if (!details) return null

  return (
    <ProductPageAccordion heading="Opis produktu" defaultOpen={true}>
      <div className='product-details prose prose-sm max-w-none'>
        {isHtml ? (
          <div
            className="storefront-description-html"
            dangerouslySetInnerHTML={{ __html: details }}
          />
        ) : (
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkBreaks]}
            rehypePlugins={[rehypeRaw, rehypeSanitize]}
            components={{
              p: ({node, ...props}) => <p className="mb-4 leading-relaxed" {...props} />,
              strong: ({node, ...props}) => <strong className="font-bold" style={{ fontWeight: 700 }} {...props} />,
              b: ({node, ...props}) => <strong className="font-bold" style={{ fontWeight: 700 }} {...props} />,
              em: ({node, ...props}) => <em className="italic" {...props} />,
              i: ({node, ...props}) => <em className="italic" {...props} />,
              h1: ({node, ...props}) => <h2 className="text-3xl font-bold mb-3 mt-6" style={{ fontWeight: 700 }} {...props} />,
              h2: ({node, ...props}) => <h2 className="text-2xl font-bold mb-2 mt-5" style={{ fontWeight: 700 }} {...props} />,
              h3: ({node, ...props}) => <h3 className="text-xl font-bold mb-2 mt-4" style={{ fontWeight: 700 }} {...props} />,
              h4: ({node, ...props}) => <h4 className="text-lg font-bold mb-2 mt-3" style={{ fontWeight: 700 }} {...props} />,
              h5: ({node, ...props}) => <h5 className="text-base font-bold mb-2 mt-3" style={{ fontWeight: 700 }} {...props} />,
              h6: ({node, ...props}) => <h6 className="text-sm font-bold mb-2 mt-2" style={{ fontWeight: 700 }} {...props} />,
              ul: ({node, ...props}) => <ul className="list-disc ml-6 mb-4 space-y-1" {...props} />,
              ol: ({node, ...props}) => <ol className="list-decimal ml-6 mb-4 space-y-1" {...props} />,
              li: ({node, ...props}) => <li className="mb-1 leading-relaxed" {...props} />,
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
              del: ({node, ...props}) => <del className="line-through text-gray-500" {...props} />,
              input: ({node, ...props}) => {
                if (props.type === 'checkbox') {
                  return <input type="checkbox" disabled className="mr-2" {...props} />;
                }
                return <input {...props} />;
              },
            }}
          >
            {normalizedMarkdown}
          </ReactMarkdown>
        )}
      </div>
      <style>{`
        .storefront-description-html p { margin-bottom: 1rem; line-height: 1.625; }
        .storefront-description-html strong { font-weight: 700; }
        .storefront-description-html em { font-style: italic; }
        .storefront-description-html u { text-decoration: underline; }
        .storefront-description-html s,
        .storefront-description-html del { text-decoration: line-through; color: #6b7280; }
        .storefront-description-html h1 { font-size: 1.875rem; font-weight: 700; margin: 1.5rem 0 0.75rem; }
        .storefront-description-html h2 { font-size: 1.5rem; font-weight: 700; margin: 1.25rem 0 0.5rem; }
        .storefront-description-html h3 { font-size: 1.25rem; font-weight: 700; margin: 1rem 0 0.5rem; }
        .storefront-description-html h4 { font-size: 1.125rem; font-weight: 700; margin: 0.75rem 0 0.5rem; }
        .storefront-description-html ul { list-style-type: disc; margin-left: 1.5rem; margin-bottom: 1rem; }
        .storefront-description-html ol { list-style-type: decimal; margin-left: 1.5rem; margin-bottom: 1rem; }
        .storefront-description-html li { margin-bottom: 0.25rem; line-height: 1.625; }
        .storefront-description-html a { color: #2563eb; text-decoration: underline; }
        .storefront-description-html a:hover { text-decoration: none; }
        .storefront-description-html code { background: #f3f4f6; padding: 0.1rem 0.3rem; border-radius: 0.2rem; font-size: 0.85em; font-family: monospace; }
        .storefront-description-html blockquote { border-left: 4px solid #d1d5db; padding-left: 1rem; font-style: italic; margin: 1rem 0; color: #6b7280; }
        .storefront-description-html table { min-width: 100%; border-collapse: collapse; margin: 1rem 0; }
        .storefront-description-html thead { background: #3B3634; color: white; }
        .storefront-description-html th { border: 1px solid #d1d5db; padding: 0.5rem 1rem; text-align: left; font-weight: 600; }
        .storefront-description-html td { border: 1px solid #d1d5db; padding: 0.5rem 1rem; }
      `}</style>
    </ProductPageAccordion>
  );
};
