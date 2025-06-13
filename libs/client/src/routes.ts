import HomePage from 'components/home/HomePage';
import SamplePage from 'components/sample/SamplePage';
import ResultPage from 'components/result/ResultPage';
import TestPage from 'components/test/TestPage';
import NotFoundPage from 'components/NotFoundPage';

export const routes = [
  {
    path: '/',
    exact: true,
    component: HomePage,
    pageProps: {
      pageId: 'home_page',
      title: 'Home Page'
    }
  },
  {
    path: '/samples',
    component: SamplePage,
    pageProps: {
      pageId: 'sample_page',
      title: 'Samples Page'
    }
  },
  {
    path: '/results',
    component: ResultPage,
    pageProps: {
      pageId: 'result_page',
      title: 'Results Page'
    }
  },
  {
    path: '/test',
    component: TestPage,
    pageProps: {
      pageId: 'test_page',
      title: 'Test Page'
    }
  },
  {
    path: '/*',
    component: NotFoundPage,
    pageProps: {
      pageId: 'not_found',
      title: 'Page not found'
    }
  }
];
