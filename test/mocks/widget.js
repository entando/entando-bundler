module.exports = {
  payload: {
    code: 'my-widget',
    titles: { en: 'My widget', it: 'Il mio widget' },
    group: 'free',
    guiFragments: [
      {
        code: 'my-widget',
        customUi: '<script>const url = "<@wp.resourceURL />bundles/my-bundle/widgets/my-widget"</script>',
        defaultUi: null,
      },
    ],
    customUi: '<p>hello</p>',
    configUi: {
      resources: [
        'bundles/my-bundle/widgets/my-widget/static/css/main.dbf0c21a.css',
      ],
      customElement: 'my-widget-config',
    },
  },
};
