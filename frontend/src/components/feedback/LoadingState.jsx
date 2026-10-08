import BrandLoader from '../ui/BrandLoader.jsx';
export default function LoadingState({ message='Loading...' }) {
  return <div role="status" aria-busy="true" aria-live="polite" className="flex flex-col items-center justify-center py-12"><BrandLoader size="sm" message={message} /></div>;
}
