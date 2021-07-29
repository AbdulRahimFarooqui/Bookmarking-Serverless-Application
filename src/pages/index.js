import React from "react"
import { useQuery, useMutation } from "@apollo/client";
import gql from "graphql-tag";
import deletePic from './delete-ico.png'

const BookMarksQuery = gql`{
  bookmark{
    id
    url
    desc
  }
}`

const AddBookMarkMutation = gql`
  mutation addBookmark($url: String!, $desc: String!){
    addBookmark(url: $url, desc: $desc){
     url 
    }
}
`

const DeleteBookmark = gql`
mutation deleteBookmark($id:ID!){
  deleteBookmark(id:$id)
}
`;

export default function Home() {
  const { loading, data } = useQuery(BookMarksQuery);
  const [addBookmark] = useMutation(AddBookMarkMutation);
  const [deleteBookmark] = useMutation(DeleteBookmark);
  let textfield;
  let desc;
  const addBookmarkSubmit = () => {
    addBookmark({
      variables: {
        url: textfield.value,
        desc: desc.value,
      },
      refetchQueries: [{ query: BookMarksQuery }],
    })
  }
  if(loading){
    return(<h1>Loading...</h1>)
  }
  if ((data !== undefined) && (data.bookmark.length !== 0)) {
    return (
      <div>
        <div>
          <input type="text" placeholder="URL" ref={node => textfield = node} />
          <input type="text" placeholder="Description" ref={node => desc = node} />
          <button onClick={addBookmarkSubmit}>Add BookMark</button>
        </div>
        <div>
          <ul style={{ listStyle: "none", display: "inline-table", width: "600px" }}>
            {data.bookmark.map((val, ind) => {
              return (
                <li key={ind}>
                  <div style={{ border: "2px solid black", marginBottom: "1%", fontSize: 16, }}>
                    <img style={{ marginLeft: "95%", marginTop: "2%" }} src={deletePic} height={20} onClick={async () => {
                      await deleteBookmark({
                        variables: {
                          id: val.id,
                        },
                        refetchQueries: [{ query: BookMarksQuery }]
                      })
                    }
                    } />
                    <div>DESCRIPTION: <p style={{ fontSize: 16 }}>{val.desc}</p><br />URL:&nbsp;<a href={val.url}>{val.url}</a> </div>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    )
  }
  return (
    <div>
      <div>
        <div>
          Bookmarks' App.<br />Please Add any web address in the URL box and add any description to it.<br />
          Remember! You need to keep the description unique
        </div>
        <input type="text" placeholder="URL" ref={node => textfield = node} />
        <input type="text" placeholder="Description" ref={node => desc = node} />
        <button onClick={addBookmarkSubmit}>Add BookMark</button>
      </div>
    </div>
  )
}