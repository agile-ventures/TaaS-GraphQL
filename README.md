# TaaS GraphQL API
Tezos as a Service - GraphQL API

## Proposed scope of work 

 - Tezos GraphQL Schema (GraphQL interface to Tezos node data) – create a draft version of the schema and actively communicate with other teams developing on Tezos to propose the first version of the Tezos GraphQL schema. 
 - Implement open source project consuming Tezos Indexer Database  and exposing GraphQL endpoint with defined Tezos schema. Docker images will be published from the beginning making it very easy for developers to run their own instance of TaaS GraphQL.
 - Provide load-balanced publicly available endpoint running TaaS GraphQL for at least 1 year . Everyone will be able to consume the API through authenticated client.  Initially Github authentication will be offered (based on feedback we can add other OAuth providers such as Gitlab). Publicly available endpoint will have the following limitations
   - Number of requests per 24 hours per client will be limited to 1 000.
   - Number of requests per minute per client will be limited to 10.
