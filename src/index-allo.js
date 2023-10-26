import './style/index-allo.scss';

import nav from './sections/nav/nav';

import './sections/main/main';
import './sections/about/about';
import './sections/services/services';
import './sections/contact/contact';

nav.init([{ id: 'main',
            scene: 'main' },
          { id: 'about',
            scene: 'mountain' },
          { id: 'services',
            scene: 'network' },
          { id: 'contact',
            scene: 'montreal' }])
