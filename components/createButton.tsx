import { Ionicons } from '@expo/vector-icons';
import { Pressable } from 'react-native';

type Props = {
  onPress: () => void;
  accessibilityLabel?: string;
};

const createButton = ({ onPress, accessibilityLabel = 'Add note' }: Props) => {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      android_ripple={{ radius: 28 }}
      className="bg-blue-600 size-16 items-center justify-center rounded-full absolute bottom-5 right-5"
    >
      <Ionicons
        name="add"
        size={28}
        color="white"
      />
    </Pressable>
  );
};

export default createButton;
