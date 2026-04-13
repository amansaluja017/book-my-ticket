
declare global {
  namespace Express {
    interface Request {
      customer: {
        id: string;
        email: string;
        role: "customer"
      },
      admin: {
        id: string;
        email: string;
        role: "admin"
      }
    }
  }
}

export { };