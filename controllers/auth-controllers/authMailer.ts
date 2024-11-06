import Mail from "nodemailer/lib/mailer";
import transporter from "../../config/email";

const verifyHtml = (targetId: string) => {
  const url = `http://localhost:8000/auth/verify/${targetId}`;
  return `<div
      style="
        width: 100%;
      "
    >
      <span style="font-size: xx-large; font-weight: bolder; margin: 20px 10px"
        >Bạn vừa đăng kí tài khoản để sử dụng Mxh</span
      >
      <div
        style="
          background-color: rgb(167, 167, 167);
          border-radius: 20px;
          padding: 40px;
          margin: 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
        "
      >
        <p style="font-size: x-large; margin: 10px">
          Vui lòng truy cập link dưới để kích hoạt tài khoản
        </p>
        <a
          href="${url}"
          style="
            color: rgb(0, 123, 255);
            text-decoration: none;
            font-size: x-large;
            margin: 10px;
          "
          >Xác nhận tài khoản</a
        >
      </div>
      <span style="font-size: xx-large; font-weight: bolder; margin: 20px 10px"
        >Trân trọng!</span
      >
    </div>`;
};

const sendMailVerify = (sendTo: string, targetId: string) => {
  var verifyMailOptions: Mail.Options = {
    from: "tainguyen.pham.133@gmail.com",
    to: sendTo,
    subject: "Xác nhận tạo tài khoản.",
    html: verifyHtml(targetId),
  };
  transporter.sendMail(verifyMailOptions);
};

export default sendMailVerify;
