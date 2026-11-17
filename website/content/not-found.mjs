// 404 page (GitHub Pages serves it for unknown paths).
export const NOT_FOUND = {
  id: 'not-found',
  path: '',
  section: '',
  layout: 'page',
  title: { en: 'Page not found', as: 'পৃষ্ঠা পোৱা নগ’ল' },
  description: { en: 'This page does not exist.', as: 'এই পৃষ্ঠাটো নাই।' },
  body: {
    en: (h) => `
<section class="page-hero not-found">
  <p class="big-code">৪০৪</p>
  <h1>Page not found</h1>
  <p>যি পৃষ্ঠা বিচাৰিছে সেইটো নাই। The page you’re looking for doesn’t exist.</p>
  <div class="hero-cta center">
    <a class="btn btn-primary" href="${h.link('')}">Go home</a>
    <a class="btn btn-secondary" href="${h.link('learn/')}">Learn Asomiya</a>
  </div>
</section>`,
    as: (h) =>
      `<section class="page-hero"><h1>পৃষ্ঠা পোৱা নগ’ল</h1><p><a href="${h.link('')}">মূল পৃষ্ঠালৈ যাওক</a></p></section>`,
  },
};
