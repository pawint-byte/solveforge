declare module 'coinbase-commerce-node' {
  export const Client: {
    init: (apiKey: string) => void;
    setRequestTimeout: (timeout: number) => void;
  };

  export const resources: {
    Charge: {
      create: (data: any) => Promise<any>;
      retrieve: (id: string) => Promise<any>;
      list: (params?: any) => Promise<any>;
    };
  };

  export const Webhook: {
    verifySigHeader: (rawBody: string, signature: string, secret: string) => void;
    verifyEventBody: (rawBody: string, signature: string, secret: string) => any;
  };
}
