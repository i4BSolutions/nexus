import { Modal, Form, Input, Button, Space } from "antd";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// Schema
const createCategorySchema = z.object({
  category_name: z.string().min(1, "Category name is required"),
});

type CreateCategoryForm = z.infer<typeof createCategorySchema>;

interface CreateCategoryModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateCategoryForm) => void;
  loading?: boolean;
}

export default function CreateCategoryModal({
  open,
  onClose,
  onSubmit,
  loading,
}: CreateCategoryModalProps) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitted },
  } = useForm<CreateCategoryForm>({
    resolver: zodResolver(createCategorySchema),
    mode: "onTouched",
    defaultValues: {
      category_name: "",
    },
  });

  const handleFinish = async (data: CreateCategoryForm) => {
    await onSubmit(data);
    reset();
  };

  const handleClose = () => {
    onClose();
    reset();
  };

  return (
    <Modal
      open={open}
      title="Create New Category"
      onCancel={handleClose}
      footer={null}
      centered
    >
      <Form layout="vertical" onFinish={handleSubmit(handleFinish)}>
        <Form.Item
          label="Category Name"
          required
          validateStatus={isSubmitted && errors.category_name ? "error" : ""}
          help={isSubmitted && errors.category_name?.message}
        >
          <Controller
            name="category_name"
            control={control}
            render={({ field }) => (
              <Input {...field} placeholder="Enter category name" />
            )}
          />
        </Form.Item>

        <Form.Item style={{ textAlign: "left" }}>
          <Space>
            <Button onClick={handleClose} disabled={isSubmitted || loading}>
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={isSubmitted || loading}
              disabled={isSubmitted || loading}
            >
              Create
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
}
