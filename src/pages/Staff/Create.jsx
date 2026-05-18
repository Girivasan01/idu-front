import { Form, Input, Button, Select, message } from "antd";
import axios from "axios";
import {
  validatePhoneNumber,
  handlePhoneInput,
  handlePhoneKeyPress,
  handlePhonePaste,
} from "@/utils/helpers";

export default function CreateStaff() {

  const onFinish = async (values) => {
    try {
      const res = await axios.post("/api/admin/createStaff", values);

      if (res.data.success) {
        message.success("Staff created successfully");
      }

    } catch (error) {
      message.error("Failed to create staff");
    }
  };

  return (
    <Form layout="vertical" onFinish={handleCreateStaff}>

        <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: "Please enter name" }]}
        >
            <Input placeholder="Enter staff name" />
        </Form.Item>

        <Form.Item
            label="Mobile Number"
            name="phone"
            rules={[
              { required: true, message: "Please enter mobile number" },
              {
                pattern: validatePhoneNumber,
                message: "Enter valid 10-digit mobile number starting with 9,8,7,6",
              },
            ]}
        >
            <Input
              placeholder="Enter mobile number"
              maxLength={10}
              inputMode="numeric"
              onInput={handlePhoneInput}
              onKeyPress={handlePhoneKeyPress}
              onPaste={handlePhonePaste}
            />
        </Form.Item>

        <Form.Item
            label="Login Email"
            name="email"
            rules={[
            { required: true, message: "Please enter login email" },
            { type: "email", message: "Enter valid email" }
            ]}
        >
            <Input placeholder="Enter login email" />
        </Form.Item>

        <Form.Item
            label="Login Password"
            name="password"
            rules={[{ required: true, message: "Please enter password" }]}
        >
            <Input.Password placeholder="Enter password" />
        </Form.Item>

        <Form.Item label="Role" name="role" initialValue="staff">
            <Select>
            <Select.Option value="staff">Staff</Select.Option>
            </Select>
        </Form.Item>

        <Form.Item>
            <Button type="primary" htmlType="submit" block>
            Create Staff
            </Button>
        </Form.Item>

    </Form>
  );
}
