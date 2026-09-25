import avatarResponsavel from "../../assets/avatar-responsavel.svg";
import avatarAdmin from "../../assets/avatar-admin.svg";

const avatars = { "assets/avatar-responsavel.svg": avatarResponsavel, "assets/avatar-admin.svg": avatarAdmin };

function UserChip({ data }) {
    return (
        <span className="user-chip">
            {data.avatar ? (
                <span className="avatar avatar--image">
                    <img src={avatars[data.avatar]} alt="" />
                </span>
            ) : (
                <span className="avatar">{data.userInitials}</span>
            )}
            {data.user}
        </span>
    );
}

export default UserChip;
