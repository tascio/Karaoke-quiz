export default function QRSection() {
    return (
      <div className="container text-center mt-5">
        <div className="row justify-content-center align-items-center g-4">
  
          <div className="col-12 col-md-6">
            <div className="card shadow-lg border-0">
              <div className="card-body p-4">
                <h3 className="card-title text-primary mb-3">
                  Connect To WiFi
                </h3>
                <img
                  src="../static/qrcodes/wifi.svg"
                  alt="WiFi QR Code"
                  className="img-fluid"
                  style={{ maxWidth: "300px" }}
                />
              </div>
            </div>
          </div>
  
          <div className="col-12 col-md-6">
            <div className="card shadow-lg border-0">
              <div className="card-body p-4">
                <h3 className="card-title text-success mb-3">
                  Join in!
                </h3>
                <img
                  src="../static/qrcodes/gamelink.svg"
                  alt="Game Link QR Code"
                  className="img-fluid"
                  style={{ maxWidth: "300px" }}
                />
              </div>
            </div>
          </div>
  
        </div>
      </div>
    );
  }
  