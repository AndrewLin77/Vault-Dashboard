import { useNavigate } from 'react-router-dom';
import CuratorLanding from '../components/CuratorLanding';
import { curatorPath } from '../lib/routes';

/** Landing page — curator list with search; navigates to curator detail on select. */
export default function HomePage() {
  const navigate = useNavigate();

  return (
    <CuratorLanding
      onSelectCurator={(curator) => {
        navigate(curatorPath(curator.name));
      }}
    />
  );
}
