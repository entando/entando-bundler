const Joi = require('@hapi/joi');

const descriptorSchema = Joi.object({
  code:
    Joi.string()
      .pattern(/^(?:[a-z0-9]+[-_.]?)+$/)
      .required(),
  components:
    Joi.object(),
  title:
    Joi.string()
      .required(),
  description:
    Joi.string(),
  author:
    Joi.object({
      name:
        Joi.string(),
      email:
        Joi.string()
          .email(),
    }),
  organization:
    Joi.string()
      .pattern(/^(?:[a-z0-9]+[-_.]?)+$/)
      .required(),
});

const bundleSchema = Joi.object({
  apiVersion:
    Joi.string()
      .valid('entando.org/v1')
      .required(),
  kind:
    Joi.string()
      .valid('EntandoComponentBundle', 'EntandoDeBundle')
      .required(),
  metadata:
    Joi.object({
      name: Joi.string()
        .hex()
        .required(),
      namespace:
        Joi.string()
          .pattern(/^(?:[a-z0-9]+[-_.]?)+$/)
          .required(),
      labels:
        Joi.object()
          .pattern(
            Joi.string().valid('true'),
            Joi.string(),
          ),
    }),
  spec:
    Joi.object({
      code:
        Joi.string()
          .pattern(/^(?:[a-z0-9]+[-_.]?)+$/)
          .required(),
      title:
        Joi.string()
          .required(),
      description:
        Joi.string(),
      author:
        Joi.object({
          name:
            Joi.string(),
          email:
            Joi.string()
              .email(),
        }),
      organization:
        Joi.string()
          .pattern(/^(?:[a-z0-9]+[-_.]?)+$/)
          .required(),
      versions:
        Joi.object({
          version:
            Joi.string(),
          url:
            Joi.string(),
          integrity:
            Joi.string(),
          timestamp:
            Joi.date()
              .timestamp(),
        }),
    }),
});

module.exports = {
  descriptorSchema,
  bundleSchema,
};
