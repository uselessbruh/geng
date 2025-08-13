import { useNavigate } from "react-router-dom";
import "./Geng.css";

function Geng() {
  const navigate = useNavigate();

  return (
    <div className="mainpage">
      <div className='paperreviewbut' onClick={() => navigate("/literature-review")}>
        Paper Review
      </div>
      <div className='generatedatabut' onClick={() => navigate("/generate-data")}>
        Generate Data
      </div>
    </div>
  );
}

export default Geng;
