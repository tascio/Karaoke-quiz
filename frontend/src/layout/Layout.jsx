export default function Layout({ children }) {
    return (
      <div className="content text-bg-dark min-vh-100">
        <div className="container-fluid text-center">
          {children}
        </div>
      </div>
    );
  }
  