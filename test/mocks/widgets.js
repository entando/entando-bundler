module.exports = {
  payload: [
    {
      code: 'my-widget',
      titles: { en: 'My widget', it: 'Il mio widget' },
      group: 'free',
      customUi: '<p><@wp.resourceURL />bundles/my-bundle/widgets/my-widget</p>',
      configUi: {
        resources: [
          'bundles/my-bundle/widgets/my-widget/static/css/main.dbf0c21a.css',
        ],
        customElement: 'my-widget-config',
      },
    },
  ],
};
