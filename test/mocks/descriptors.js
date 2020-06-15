module.exports = {
  pluralDescriptor:
    `---
    code: pda-ecr-bundle
    components:
      fragments:
        - fragments/fragment-one-descriptor.yaml
        - fragments/fragment-two-descriptor.yaml
      pageTemplates:
        - page-templates/page-template-one-descriptor.yaml
        - page-templates/page-template-two-descriptor.yaml
      contentTemplates:
        - content-templates/content-template-one-descriptor.yaml
      widgets:
        - widgets/widget-descriptor.yaml
      plugins:
        - plugins/plugin-descriptor.yaml
      contentTypes:
        - content-types/content-type-descriptor.yaml
    description: "An example bundle for PDA related components (widgets, fragments, page templates and pages)."`,

  oldNomenclatureDescriptor:
    `---
    code: pda-ecr-bundle
    components:
      pageModels:
        - page-models/page-model-one-descriptor.yaml
      contentModels:
        - content-models/content-model-descriptor.yaml
    description: "An example bundle for PDA related components (widgets, fragments, page templates and pages)."`,

  emptyDescriptor:
    `---
    code: pda-ecr-bundle
    components:
      fragments:
      pageTemplates:
      contentTemplates:
      widgets:
      plugins:
      contentTypes:
    description: "An example bundle for PDA related components (widgets, fragments, page templates and pages)."`,
};
