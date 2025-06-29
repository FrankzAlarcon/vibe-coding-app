interface Props {
    params: Promise<{ projectId: string }>
}

const ProjectEntryPage = async ({ params }: Props) => {
  const { projectId } = await params
  return (
    <div className='h-screen w-screen flex items-center justify-center'>
        Project {projectId}
    </div>
    )
}

export default ProjectEntryPage