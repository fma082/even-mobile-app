import { Placeholder } from '@/components/Placeholder';

export default function LearnScreen() {
  return (
    <Placeholder
      title="Learn"
      links={[{ label: 'Open content', href: { pathname: '/content/[slug]', params: { slug: 'getting-started' } } }]}
    />
  );
}
