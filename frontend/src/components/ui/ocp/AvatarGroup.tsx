import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { User } from "@/types/entities/index";

const AvatarGroup = ({ users }: { users: User[] }) => {
  return (
    <div className="flex -space-x-6 *:ring *:ring-background">
      {users.slice(0, 3).map((user, index) => (
        <Avatar className="size-8 md:size-10 2xl:size-12" key={index}>
          <AvatarImage src={user.avatar?.url} />
        </Avatar>
      ))}
    </div>
  );
};

export default AvatarGroup;
