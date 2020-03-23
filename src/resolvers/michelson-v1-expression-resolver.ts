export const michelsonV1ExpressionResolver = {
    MichelsonV1Expression: {
        __resolveType(obj: any, context: any, info: any) {
          if (obj.prim) {
            return "MichelsonV1ExpressionExtended";
          }
          else {
            return "MichelsonV1ExpressionBase";
          }
        }
      }
}
