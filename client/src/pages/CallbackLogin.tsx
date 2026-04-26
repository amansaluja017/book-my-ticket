import axios from "axios";
import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { login } from "../slice/authSlice";

function CallbackLogin() {
  const [searchParams] = useSearchParams();
  const code = searchParams.get("code") || "";
  const state = searchParams.get("state") || "";

  const oauth_state = sessionStorage.getItem("oauth_state");
  const nonce = sessionStorage.getItem("oauth_nonce");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    async function exchangeCodeForToken() {
      if (state !== oauth_state) {
        console.error("Invalid state parameter");
        return;
      }

      const response = await axios.post(
        `${import.meta.env.VITE_API_ENDPOINT}/customer/o/token`,
        {
          code,
          nonce,
        },
        { withCredentials: true },
      );
      const accessToken = response.data.data.accessToken;

      const userResponse = await axios.get(`http://localhost:3001/o/userinfo`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (userResponse.status === 200) {
        const userData = userResponse.data.data;
        dispatch(login({ ...userData, role: "customer", token: accessToken }));
        sessionStorage.removeItem("oauth_state");
        sessionStorage.removeItem("oauth_nonce");
        navigate("/");
      }
    };

    exchangeCodeForToken();
  }, [code, state, oauth_state]);

  return <div>CallbackLogin</div>;
}

export default CallbackLogin;
