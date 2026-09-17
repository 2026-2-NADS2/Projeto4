function UserChip({ data }) {
    return (
        <span className="user-chip">
            {data.avatar ? (
                <span className="avatar avatar--image">
                    <img src={`/${data.avatar}`} alt="" />
                </span>
            ) : (
                <span className="avatar">{data.userInitials}</span>
            )}
            {data.user}
        </span>
    );
}

export default UserChip;