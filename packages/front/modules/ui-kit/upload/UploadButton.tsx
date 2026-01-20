import { CloudUpload } from "@mui/icons-material";
import { classes } from "#modules/utils/styles";
import styles from "./UploadButton.module.css";

type Props = {
  isUploading?: boolean;
  onClick?: ()=> void;
  className?: string;
  disabled?: boolean;
  titleAccess?: string;
};
export const UploadButton = ( { disabled = true,
  isUploading = false,
  onClick, className, titleAccess = "Subir archivos" }: Props) => {
  return <CloudUpload
    className={classes(
      styles.uploadIcon,
      !disabled && styles.iconActive,
      !disabled && styles.uploadReady,
      disabled && styles.uploadDisabled,
      className,
    )}
    onClick={isUploading ? undefined : onClick}
    titleAccess={titleAccess}
  />;
};
