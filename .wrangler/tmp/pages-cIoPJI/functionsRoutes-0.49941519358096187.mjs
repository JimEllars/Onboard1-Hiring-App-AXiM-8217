import { onRequestOptions as __api_apply_js_onRequestOptions } from "/app/functions/api/apply.js"
import { onRequestPost as __api_apply_js_onRequestPost } from "/app/functions/api/apply.js"
import { onRequestGet as __api_verify_js_onRequestGet } from "/app/functions/api/verify.js"

export const routes = [
    {
      routePath: "/api/apply",
      mountPath: "/api",
      method: "OPTIONS",
      middlewares: [],
      modules: [__api_apply_js_onRequestOptions],
    },
  {
      routePath: "/api/apply",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_apply_js_onRequestPost],
    },
  {
      routePath: "/api/verify",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_verify_js_onRequestGet],
    },
  ]