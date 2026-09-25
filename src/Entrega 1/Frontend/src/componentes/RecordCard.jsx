import StatusBadge from "./StatusBadge.jsx";

function RecordCard({ record }) {
    return (
        <article className="record-card">
            <div className="record-info">
                <span className="avatar" aria-hidden="true">{record.student.split(" ").slice(0, 2).map(name => name[0]).join("")}</span>
                <div>
                    <p className="record-title">{record.student}</p>
                    <p className="record-meta">{record.subject}</p>
                    {record.description && <p className="record-description">{record.description}</p>}
                </div>
            </div>
            <div className="record-result">
                <span className="score">{record.score}</span>
                <StatusBadge value={record.status} />
            </div>
        </article>
    );
}

export default RecordCard;
