import { usePathname, useRouter } from '@/i18n/routing';
import { useSearchParams } from 'next/navigation';

const useUpdateSearchParams = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const updateSearchParams = (
    field: string,
    value: string | null
  ) => {
    const updatedSearchParams = new URLSearchParams(
      searchParams.toString()
    );
    if (!value) {
      updatedSearchParams.delete(field);
    } else {
      updatedSearchParams.set(field, value);
    }

    // CRITICAL FIX: Use router.push instead of router.replace
    // router.replace doesn't trigger proper re-renders for InstantSearch
    // router.push ensures the component re-renders with new sort/filter params
    router.push(`${pathname}?${updatedSearchParams}`, {
      scroll: false,
    });
  };

  return updateSearchParams;
};

export default useUpdateSearchParams;
