import { TabsTrigger } from '@/components/atoms';
import { Link } from '@/i18n/routing';

export const TabsList = ({
  list,
  activeTab,
}: {
  list: { label: string; link: string }[];
  activeTab: string;
}) => {
  return (
    <div className='flex gap-4 w-full border-b border-[#3B3634] font-instrument-sans'>
      {list.map(({ label, link }) => {
        const isActive = activeTab.trim() === label.toLowerCase().trim();
        
        return (
          <Link key={label} href={link}>
            <TabsTrigger isActive={isActive}>
              {label}
            </TabsTrigger>
          </Link>
        );
      })}
    </div>
  );
};
