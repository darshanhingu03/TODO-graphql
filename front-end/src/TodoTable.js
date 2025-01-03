// First, install the required dependencies:
// npm install @mui/material @mui/icons-material @emotion/react @emotion/styled @mui/x-data-grid

import React, { useState } from "react";
import { useQuery, gql } from "@apollo/client";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Typography,
  Chip,
  TextField,
  InputAdornment,
  Box,
  CircularProgress,
  Alert,
  useTheme,
} from "@mui/material";
import {
  Search as SearchIcon,
  ArrowDownward as ArrowDownwardIcon,
  ArrowUpward as ArrowUpwardIcon,
} from "@mui/icons-material";
import { createTheme, ThemeProvider } from "@mui/material/styles";

// Define your GraphQL query
const GET_TODOS = gql`
  query getAllTodosWithUser {
    getTodos {
      id
      title
      completed
      user {
        id
        name
      }
    }
  }
`;

// Create a custom theme
const tableTheme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
    },
    background: {
      default: "#f5f5f5",
    },
  },
  components: {
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: "#f5f5f7",
          "& .MuiTableCell-head": {
            fontWeight: 600,
            color: "#1a1a1a",
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          "&:nth-of-type(odd)": {
            backgroundColor: "#fafafa",
          },
          "&:hover": {
            backgroundColor: "#f0f7ff !important",
          },
          transition: "background-color 0.2s ease",
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: "#e0e0e0",
          padding: "16px",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: "6px",
        },
      },
    },
  },
});

const TodoTable = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [orderBy, setOrderBy] = useState("title");
  const [order, setOrder] = useState("asc");
  const [searchTerm, setSearchTerm] = useState("");
  const theme = useTheme();

  const { loading, error, data } = useQuery(GET_TODOS);

  const handleSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filterAndSortData = (data) => {
    if (!data?.getTodos) return [];

    return [...data.getTodos]
      .filter((todo) => {
        const searchStr = searchTerm.toLowerCase();
        return (
          todo.title.toLowerCase().includes(searchStr) ||
          (todo.user?.name || "").toLowerCase().includes(searchStr)
        );
      })
      .sort((a, b) => {
        const factor = order === "asc" ? 1 : -1;
        switch (orderBy) {
          case "title":
            return factor * a.title.localeCompare(b.title);
          case "status":
            return (
              factor * (a.completed === b.completed ? 0 : a.completed ? 1 : -1)
            );
          case "user":
            return (
              factor * (a.user?.name || "").localeCompare(b.user?.name || "")
            );
          default:
            return 0;
        }
      });
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight={400}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        Error: {error.message}
      </Alert>
    );
  }

  const filteredData = filterAndSortData(data);
  const emptyRows = Math.max(
    0,
    rowsPerPage -
      filteredData.slice(page * rowsPerPage, (page + 1) * rowsPerPage).length
  );

  return (
    <ThemeProvider theme={tableTheme}>
      <Box sx={{ width: "100%", maxWidth: 1200, mx: "auto", p: 3 }}>
        <Paper elevation={3} sx={{ width: "100%", mb: 2, borderRadius: 2 }}>
          {/* Search Field */}
          <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search todos or users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <TableContainer>
            <Table sx={{ minWidth: 750 }} size="medium">
              <TableHead>
                <TableRow>
                  {[
                    { id: "title", label: "Title", width: "40%" },
                    { id: "status", label: "Status", width: "20%" },
                    { id: "user", label: "Assigned To", width: "40%" },
                  ].map((column) => (
                    <TableCell
                      key={column.id}
                      width={column.width}
                      sortDirection={orderBy === column.id ? order : false}
                    >
                      <TableSortLabel
                        active={orderBy === column.id}
                        direction={orderBy === column.id ? order : "asc"}
                        onClick={() => handleSort(column.id)}
                        IconComponent={
                          order === "asc" ? ArrowDownwardIcon : ArrowUpwardIcon
                        }
                      >
                        <Typography variant="subtitle2">
                          {column.label}
                        </Typography>
                      </TableSortLabel>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredData
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((todo) => (
                    <TableRow key={todo.id} hover>
                      <TableCell>
                        <Typography variant="body2">{todo.title}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={todo.completed ? "Completed" : "Pending"}
                          color={todo.completed ? "success" : "warning"}
                          variant="outlined"
                          size="small"
                          sx={{
                            minWidth: 85,
                            textAlign: "center",
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {todo.user?.name || "Unassigned"}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                {emptyRows > 0 && (
                  <TableRow style={{ height: 53 * emptyRows }}>
                    <TableCell colSpan={3} />
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredData.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      </Box>
    </ThemeProvider>
  );
};

export default TodoTable;
