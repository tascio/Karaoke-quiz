export default function Countdown({ count }) {
    return (
      <div className="countdown-overlay">
        <div className="countdown-number">
          {count}
        </div>
      </div>
    );
  }
  