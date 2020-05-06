# TaaS GraphQL

## About TaaS GraphQL

TaaS GraphQL provides [GraphQL](https://graphql.org/) API interface to [Tezos Node RPC API](https://tezos.gitlab.io/api/rpc.html) based on [TZIP-14](https://gitlab.com/tzip/tzip/-/blob/master/proposals/tzip-14/tzip-14.md).

## Documentation

> [https://docs.tezoslive.io/docs-welcome](https://docs.tezoslive.io/docs-welcome)

## Running TaaS GraphQL in Docker

**Requirements**

-   Docker
-   Tezos Node with enabled RPC endpoint supporting read-only calls

Ready-to-use docker image is available from Docker Hub here:
[**https://hub.docker.com/r/tezoslive/taas-graphql**](https://hub.docker.com/r/tezoslive/taas-graphql)

Example of the `docker run` command

-   exposing port 3000
-   setting the Tezos:NodeUrl environment variable to [https://api.tezos.org.ua](https://api.tezos.org.ua)

Do not forget to change the **Tezos:NodeUrl** based on your configuration!

```bash
docker run --rm -it -p 3000:3000 \
--env TEZOS_NODE="https://api.tezos.org.ua" \
tezoslive/taas-graphql
```

### Optional Configuration

By providing the following ENV variables you can override default configuration.

```bash
docker run --rm -it -p 3000:3000 \
--env PORT="3000" \
--env TEZOS_NODE="https://api.tezos.org.ua" \
--env MAX_BLOCKS="5" \
--env GRAPHQL_ENABLE_PLAYGROUND="true" \
--env GRAPHQL_ENABLE_INTROSPECTION="true" \
--env ENABLE_API_KEY="true" \
--env API_KEY="random!@#123String" \
tezoslive/taas-graphql
```

-   `PORT` configuration for the port on which NodeJS server listens. Default is `3000`.
-   `TEZOS_NODE` configuration for the Tezos Node RPC API endpoint. Default is [`https://api.tezos.org.ua`](https://api.tezos.org.ua)
-   `MAX_BLOCKS` configuration for the maximum number of blocks that can be fetched using `blocks` GraphQL query. Default is `5`.
-   `GRAPHQL_ENABLE_PLAYGROUND` configuration for the GraphQL playground. Default is `true`. It is recommend as best practice to disable this in production environment by Apollo.
-   `GRAPHQL_ENABLE_INTROSPECTION` configuration for the GraphQL introspection. Default is `true`. It is recommend as best practice to disable this in production environment by Apollo.
-   `ENABLE_API_KEY` if enabled API Key is required with each request. API key needs to be provided in the `X-TaaS-Key` header. Default is `false`.
-   `API_KEY` configures the API key value. There is no default value.

### Testing your GraphQL API endpoint

If you have used default port number \(3000\) and exposed the port using `docker run` command mentioned above, you should be able to access the following URL in the browser \(with enabled `GRAPHQL_ENABLE_PLAYGROUND`\).

> [htp://127.0.0.1:3000/graphql](htp://127.0.0.1:3000/graphql)

### GraphQL Schema

You can take a look at the schema in the GraphQL playground or on the link below.

> [https://github.com/agile-ventures/TaaS-docs/blob/master/docs-graphql/schema.graphql](https://github.com/agile-ventures/TaaS-docs/blob/master/docs-graphql/schema.graphql)

### Performance & Caching

If you need a caching layer between your GraphQL Docker container and your Tezos Node, you can use TezProxy.

> [https://github.com/tezexInfo/TezProxy](https://github.com/tezexInfo/TezProxy)

### Security & Deployment

For a simple use case you can enable single API key directly on the TaaS GraphQL cointainer with

-   `ENABLE_API_KEY`
-   `API_KEY`

If you need more complex solution, like JWT token authentication, rate limiting \(throttling\) or load balancing please take a look at the following resources.

-   [https://www.haproxy.com/blog/using-haproxy-as-an-api-gateway-part-1/](https://www.haproxy.com/blog/using-haproxy-as-an-api-gateway-part-1/)

-   [https://docs.nginx.com/nginx/admin-guide/security-controls/configuring-jwt-authentication/](https://docs.nginx.com/nginx/admin-guide/security-controls/configuring-jwt-authentication/)

-   [https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-control-access-to-api.html](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-control-access-to-api.html)

-   [https://docs.microsoft.com/en-us/azure/api-management/api-management-key-concepts](https://docs.microsoft.com/en-us/azure/api-management/api-management-key-concepts)

One possible scenario if you opt out to have TaaS deployed on VMs or dedicated servers could be to have HAProxy load balancer configure with JWT authentication running in from of the TaaS docker containers.

There are multiple options in case you will opt out to host your TaaS GraphQL stack in the cloud running in the serverless mode \(AWS Lambda, Azure Functions, Cloudflare Workers, etc.\) and the best solution will depend on your specific cloud provider.
