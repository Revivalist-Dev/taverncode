function board(name: string) {
  return /(?:^|_)taverncode_board(?:_reset)?$/.test(name)
}

export function file(name: string, value: string) {
  return board(name) ? `// taverncode_change - new file\n${value}` : value
}

export function block(name: string | undefined, source: string, value: string) {
  return (name !== undefined && board(name)) ||
    /tavern_board(?:_message)?|part_session_step_finish_idx|recall_(?:part_search|message_role)_idx/.test(source)
    ? `// taverncode_change start\n${value}\n// taverncode_change end`
    : value
}

export function line(name: string, value: string) {
  return board(name) || name.endsWith("_taverncode_model_usage_index") ? `${value} // taverncode_change` : value
}
